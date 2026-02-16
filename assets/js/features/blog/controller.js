import { formatDateTimeRu } from "../../shared/format.js";
import {
  DEFAULT_INCREMENTAL_PAGE_SIZE,
  createIncrementalFeed,
} from "../../shared/incremental-feed.js";
import { TELEGRAM_CHANNEL_URL } from "./mapper.js";
import {
  renderBlogLoading,
  renderBlogPostsAppend,
  renderBlogPostsReplace,
  renderBlogUnavailable,
} from "./renderer.js";
import { fetchBlogPosts } from "./service.js";

const INLINE_READ_LABEL = "Прочитать здесь";
const INLINE_COLLAPSE_LABEL = "Свернуть";
const REFLOW_DURATION_MS = 1080;
const DESKTOP_LAYOUT_QUERY = "(min-width: 1081px)";
const ROW_MATCH_THRESHOLD_PX = 2;
const CARD_SCROLL_OFFSET_PX = 16;

const isReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const initRefreshButtonMarkup = (refreshButton) => {
  if (!(refreshButton instanceof HTMLButtonElement)) {
    return null;
  }

  refreshButton.innerHTML = `
    <span class="material-symbols-outlined blog-refresh-icon" aria-hidden="true">sync</span>
    <span class="blog-refresh-label">Обновить</span>
  `;

  return refreshButton.querySelector(".blog-refresh-label");
};

const setRefreshState = ({ refreshButton, labelNode, loading }) => {
  if (!(refreshButton instanceof HTMLButtonElement)) {
    return;
  }

  refreshButton.disabled = loading;
  refreshButton.classList.toggle("is-loading", loading);
  refreshButton.setAttribute("aria-busy", loading ? "true" : "false");

  if (labelNode instanceof HTMLElement) {
    labelNode.textContent = loading ? "Обновляю" : "Обновить";
  }
};

const captureCardLayout = (feedRoot) =>
  Array.from(feedRoot.querySelectorAll(".blog-card")).map((card) => ({
    card,
    rect: card.getBoundingClientRect(),
  }));

const isDesktopLayout = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia(DESKTOP_LAYOUT_QUERY).matches;

const resolveStickyHeaderOffset = () => {
  const header = document.querySelector(".site-header.site-header-static");
  if (!(header instanceof HTMLElement)) {
    return 0;
  }

  const headerHeight = header.getBoundingClientRect().height;
  return Number.isFinite(headerHeight) ? headerHeight : 0;
};

const snapViewportToCardStart = (card) => {
  if (!(card instanceof HTMLElement)) {
    return;
  }

  const headerOffset = resolveStickyHeaderOffset();
  const targetTop = Math.max(
    0,
    card.getBoundingClientRect().top + window.scrollY - headerOffset - CARD_SCROLL_OFFSET_PX,
  );

  if (Math.abs(targetTop - window.scrollY) < 1) {
    return;
  }

  window.scrollTo({
    top: targetTop,
    behavior: isReducedMotion() ? "auto" : "smooth",
  });
};

const resolveCardIndex = (card) => {
  if (!(card instanceof HTMLElement)) {
    return Number.POSITIVE_INFINITY;
  }

  const value = Number.parseInt(card.dataset.blogIndex || "", 10);
  return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
};

const restoreCardOrder = (feedRoot) => {
  if (!(feedRoot instanceof HTMLElement)) {
    return;
  }

  const cards = Array.from(feedRoot.querySelectorAll(".blog-card"));
  if (cards.length < 2) {
    return;
  }

  cards
    .sort((left, right) => resolveCardIndex(left) - resolveCardIndex(right))
    .forEach((card) => {
      feedRoot.append(card);
    });
};

const placeExpandedCardBeforeRowMate = (feedRoot, card) => {
  if (!isDesktopLayout() || !(feedRoot instanceof HTMLElement) || !(card instanceof HTMLElement)) {
    return;
  }

  const previousCard = card.previousElementSibling;
  if (!(previousCard instanceof HTMLElement) || !previousCard.classList.contains("blog-card")) {
    return;
  }

  const topDelta = Math.abs(
    card.getBoundingClientRect().top - previousCard.getBoundingClientRect().top,
  );
  if (topDelta > ROW_MATCH_THRESHOLD_PX) {
    return;
  }

  feedRoot.insertBefore(card, previousCard);
};

const animateReflow = (layoutBefore, { skipCard } = {}) => {
  if (!Array.isArray(layoutBefore) || layoutBefore.length === 0 || isReducedMotion()) {
    return;
  }

  const movedCards = [];

  layoutBefore.forEach(({ card, rect: previousRect }) => {
    if (!(card instanceof HTMLElement) || card === skipCard) {
      return;
    }

    const nextRect = card.getBoundingClientRect();
    const deltaX = previousRect.left - nextRect.left;
    const deltaY = previousRect.top - nextRect.top;

    if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
      return;
    }

    card.style.transition = "none";
    card.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    card.style.willChange = "transform";
    movedCards.push(card);
  });

  if (movedCards.length === 0) {
    return;
  }

  window.requestAnimationFrame(() => {
    movedCards.forEach((card) => {
      card.style.transition = `transform ${REFLOW_DURATION_MS}ms cubic-bezier(0.2, 0.9, 0.25, 1)`;
      card.style.transform = "";

      const cleanup = () => {
        card.style.transition = "";
        card.style.willChange = "";
      };

      card.addEventListener("transitionend", cleanup, { once: true });
      window.setTimeout(cleanup, REFLOW_DURATION_MS + 70);
    });
  });
};

const setCardExpandedState = (card, expanded) => {
  if (!(card instanceof HTMLElement)) {
    return;
  }

  const toggleButton = card.querySelector("[data-blog-read-toggle]");
  const contentNode = card.querySelector("[data-blog-content]");

  card.classList.toggle("is-expanded", expanded);

  if (toggleButton instanceof HTMLButtonElement) {
    toggleButton.textContent = expanded ? INLINE_COLLAPSE_LABEL : INLINE_READ_LABEL;
    toggleButton.setAttribute("aria-expanded", expanded ? "true" : "false");
  }

  if (contentNode instanceof HTMLElement) {
    contentNode.setAttribute("aria-hidden", expanded ? "false" : "true");
  }
};

const initInlineReadToggles = (feedRoot) => {
  if (!(feedRoot instanceof HTMLElement) || feedRoot.dataset.blogReadToggleBound === "true") {
    return;
  }

  feedRoot.dataset.blogReadToggleBound = "true";

  feedRoot.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const toggleButton = event.target.closest("[data-blog-read-toggle]");

    if (!(toggleButton instanceof HTMLButtonElement) || !feedRoot.contains(toggleButton)) {
      return;
    }

    const card = toggleButton.closest(".blog-card");
    if (!(card instanceof HTMLElement)) {
      return;
    }

    const shouldExpand = !card.classList.contains("is-expanded");

    toggleButton.blur();
    const layoutBefore = captureCardLayout(feedRoot);

    if (shouldExpand) {
      feedRoot.querySelectorAll(".blog-card.is-expanded").forEach((expandedCard) => {
        if (expandedCard !== card) {
          setCardExpandedState(expandedCard, false);
        }
      });

      restoreCardOrder(feedRoot);
      placeExpandedCardBeforeRowMate(feedRoot, card);
    }

    setCardExpandedState(card, shouldExpand);

    if (!shouldExpand) {
      restoreCardOrder(feedRoot);
    }

    if (shouldExpand && isDesktopLayout()) {
      snapViewportToCardStart(card);
    }

    animateReflow(layoutBefore, { skipCard: shouldExpand ? card : null });
  });
};

export const initBlogFeed = async ({
  feedId = "blog-feed",
  moreButtonId = "blog-more",
  refreshButtonId = "blog-refresh",
  countId = "blog-count",
  updatedId = "blog-updated",
  pageSize = DEFAULT_INCREMENTAL_PAGE_SIZE,
} = {}) => {
  const feedRoot = document.getElementById(feedId);
  const moreButton = document.getElementById(moreButtonId);
  const refreshButton = document.getElementById(refreshButtonId);
  const countNode = document.getElementById(countId);
  const updatedNode = document.getElementById(updatedId);

  if (!(feedRoot instanceof HTMLElement)) {
    return;
  }

  initInlineReadToggles(feedRoot);

  const refreshLabel = initRefreshButtonMarkup(refreshButton);

  let totalPosts = 0;

  const updateStats = ({ includeUpdatedAt = false } = {}) => {
    if (countNode instanceof HTMLElement) {
      countNode.textContent = String(totalPosts);
    }

    if (includeUpdatedAt && updatedNode instanceof HTMLElement) {
      updatedNode.textContent = formatDateTimeRu(new Date());
    }
  };

  const feed = createIncrementalFeed({
    root: feedRoot,
    moreButton,
    pageSize,
    renderLoading: ({ root }) => {
      renderBlogLoading(root);
    },
    renderEmpty: ({ root }) => {
      renderBlogUnavailable(root, TELEGRAM_CHANNEL_URL);
    },
    renderReplace: ({ root, items }) => {
      renderBlogPostsReplace({ root, posts: items });
    },
    renderAppend: ({ root, items, startIndex }) => {
      renderBlogPostsAppend({
        root,
        posts: items,
        startIndex,
      });
    },
    onStateChange: ({ totalCount }) => {
      totalPosts = totalCount;
      updateStats();
    },
  });

  if (!feed) {
    return;
  }

  const refreshFeed = async () => {
    setRefreshState({ refreshButton, labelNode: refreshLabel, loading: true });
    feed.showLoading();

    const minAnimationDelay = new Promise((resolve) => {
      window.setTimeout(resolve, 320);
    });

    let posts = [];

    try {
      const [loadedPosts] = await Promise.all([fetchBlogPosts(), minAnimationDelay]);
      posts = loadedPosts;
    } catch {
      await minAnimationDelay;
    }

    feed.setItems(posts);
    updateStats({ includeUpdatedAt: true });
    setRefreshState({ refreshButton, labelNode: refreshLabel, loading: false });
  };

  if (refreshButton instanceof HTMLButtonElement) {
    refreshButton.addEventListener("click", () => {
      void refreshFeed();
    });
  }

  await refreshFeed();
};
