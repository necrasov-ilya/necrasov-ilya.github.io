export const DEFAULT_INCREMENTAL_PAGE_SIZE = 6;

const DEFAULT_EXPANSION_DURATION_MS = 420;

const resolvePositiveInt = (value, fallback) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  const normalized = Math.trunc(value);
  return normalized > 0 ? normalized : fallback;
};

const shouldReduceMotion = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export const animateHeightExpansion = ({
  container,
  fromHeight,
  toHeight,
  durationMs = DEFAULT_EXPANSION_DURATION_MS,
} = {}) => {
  if (!(container instanceof Element)) {
    return;
  }

  if (typeof fromHeight !== "number" || typeof toHeight !== "number" || toHeight <= fromHeight) {
    return;
  }

  if (shouldReduceMotion()) {
    return;
  }

  container.style.height = `${fromHeight}px`;
  container.style.overflow = "hidden";
  container.style.transition = `height ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1)`;

  window.requestAnimationFrame(() => {
    container.style.height = `${toHeight}px`;
  });

  window.setTimeout(() => {
    container.style.height = "";
    container.style.overflow = "";
    container.style.transition = "";
  }, durationMs + 40);
};

export const createIncrementalFeed = ({
  root,
  moreButton,
  pageSize = DEFAULT_INCREMENTAL_PAGE_SIZE,
  renderLoading,
  renderEmpty,
  renderReplace,
  renderAppend,
  onStateChange,
  animateExpansion = animateHeightExpansion,
} = {}) => {
  if (!(root instanceof Element)) {
    return null;
  }

  const state = {
    items: [],
    visibleCount: 0,
    pageSize: resolvePositiveInt(pageSize, DEFAULT_INCREMENTAL_PAGE_SIZE),
  };

  const emitState = () => {
    if (typeof onStateChange !== "function") {
      return;
    }

    onStateChange({
      totalCount: state.items.length,
      visibleCount: state.visibleCount,
      hasMore: state.visibleCount < state.items.length,
    });
  };

  const syncMoreButton = () => {
    if (!(moreButton instanceof HTMLButtonElement)) {
      return;
    }

    moreButton.hidden = state.items.length === 0 || state.visibleCount >= state.items.length;
  };

  const setEmptyState = () => {
    state.visibleCount = 0;
    if (typeof renderEmpty === "function") {
      renderEmpty({ root });
    }
    syncMoreButton();
    emitState();
  };

  const setItems = (nextItems) => {
    state.items = Array.isArray(nextItems) ? nextItems : [];

    if (state.items.length === 0) {
      setEmptyState();
      return;
    }

    state.visibleCount = Math.min(state.pageSize, state.items.length);
    const initialItems = state.items.slice(0, state.visibleCount);

    if (typeof renderReplace === "function") {
      renderReplace({ root, items: initialItems });
    }

    syncMoreButton();
    emitState();
  };

  const showLoading = () => {
    if (typeof renderLoading === "function") {
      renderLoading({ root });
    }

    if (moreButton instanceof HTMLButtonElement) {
      moreButton.hidden = true;
    }
  };

  const showNextPage = () => {
    if (state.visibleCount >= state.items.length) {
      syncMoreButton();
      return false;
    }

    const startIndex = state.visibleCount;
    const nextVisibleCount = Math.min(state.visibleCount + state.pageSize, state.items.length);
    const nextItems = state.items.slice(startIndex, nextVisibleCount);

    const fromHeight = root.getBoundingClientRect().height;

    if (typeof renderAppend === "function") {
      renderAppend({ root, items: nextItems, startIndex });
    }

    state.visibleCount = nextVisibleCount;
    syncMoreButton();
    emitState();

    const toHeight = root.getBoundingClientRect().height;
    if (typeof animateExpansion === "function") {
      animateExpansion({
        container: root,
        fromHeight,
        toHeight,
      });
    }

    return true;
  };

  if (moreButton instanceof HTMLButtonElement) {
    moreButton.hidden = true;
    moreButton.addEventListener("click", showNextPage);
  }

  return {
    setItems,
    showLoading,
    showNextPage,
    getState: () => ({
      totalCount: state.items.length,
      visibleCount: state.visibleCount,
      pageSize: state.pageSize,
      hasMore: state.visibleCount < state.items.length,
    }),
  };
};
