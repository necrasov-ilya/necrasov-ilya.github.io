import { formatDateTimeRu } from "../../shared/format.js";
import { BLOG_PAGE_SIZE, TELEGRAM_CHANNEL_URL } from "./mapper.js";
import {
  animateFeedExpansion,
  renderBlogLoading,
  renderBlogPosts,
  renderBlogUnavailable,
  setMoreButtonState,
} from "./renderer.js";
import { fetchBlogPosts } from "./service.js";

const initRefreshButtonMarkup = (refreshButton) => {
  if (!refreshButton) {
    return null;
  }

  refreshButton.innerHTML = `
    <span class="material-symbols-outlined blog-refresh-icon" aria-hidden="true">sync</span>
    <span class="blog-refresh-label">Обновить</span>
  `;

  return refreshButton.querySelector(".blog-refresh-label");
};

const setRefreshState = ({ refreshButton, labelNode, loading }) => {
  if (!refreshButton) {
    return;
  }

  refreshButton.disabled = loading;
  refreshButton.classList.toggle("is-loading", loading);
  refreshButton.setAttribute("aria-busy", loading ? "true" : "false");

  if (labelNode) {
    labelNode.textContent = loading ? "Обновляю" : "Обновить";
  }
};

export const initBlogFeed = async ({
  feedId = "blog-feed",
  moreButtonId = "blog-more",
  refreshButtonId = "blog-refresh",
  countId = "blog-count",
  updatedId = "blog-updated",
} = {}) => {
  const feedRoot = document.getElementById(feedId);
  const moreButton = document.getElementById(moreButtonId);
  const refreshButton = document.getElementById(refreshButtonId);
  const countNode = document.getElementById(countId);
  const updatedNode = document.getElementById(updatedId);

  if (!feedRoot) {
    return;
  }

  let allPosts = [];
  let visibleCount = 0;

  const refreshLabel = initRefreshButtonMarkup(refreshButton);

  const updateStats = () => {
    if (countNode) {
      countNode.textContent = String(allPosts.length);
    }

    if (updatedNode) {
      updatedNode.textContent = formatDateTimeRu(new Date());
    }
  };

  const renderCurrent = (previousCount = 0, animateNewCards = false) => {
    if (allPosts.length === 0) {
      renderBlogUnavailable(feedRoot, TELEGRAM_CHANNEL_URL);
      if (moreButton) {
        moreButton.hidden = true;
      }
      updateStats();
      return;
    }

    renderBlogPosts({
      root: feedRoot,
      posts: allPosts,
      visibleCount,
      previousCount,
      animateNewCards,
    });

    setMoreButtonState({
      button: moreButton,
      visibleCount,
      totalCount: allPosts.length,
    });

    updateStats();
  };

  const refreshFeed = async () => {
    setRefreshState({ refreshButton, labelNode: refreshLabel, loading: true });
    if (moreButton) {
      moreButton.hidden = true;
    }

    const minAnimationDelay = new Promise((resolve) => {
      window.setTimeout(resolve, 320);
    });

    try {
      const [posts] = await Promise.all([fetchBlogPosts(), minAnimationDelay]);
      allPosts = posts;
    } catch {
      await minAnimationDelay;
      allPosts = [];
    }

    visibleCount = Math.min(BLOG_PAGE_SIZE, allPosts.length);
    renderCurrent(0, false);
    setRefreshState({ refreshButton, labelNode: refreshLabel, loading: false });
  };

  if (moreButton) {
    moreButton.addEventListener("click", () => {
      if (visibleCount >= allPosts.length) {
        moreButton.hidden = true;
        return;
      }

      const previousCount = visibleCount;
      const fromHeight = feedRoot.getBoundingClientRect().height;
      visibleCount = Math.min(visibleCount + BLOG_PAGE_SIZE, allPosts.length);
      renderCurrent(previousCount, true);
      const toHeight = feedRoot.getBoundingClientRect().height;

      animateFeedExpansion({
        root: feedRoot,
        fromHeight,
        toHeight,
      });
    });
  }

  if (refreshButton) {
    refreshButton.addEventListener("click", refreshFeed);
  }

  renderBlogLoading(feedRoot);
  await refreshFeed();
};
