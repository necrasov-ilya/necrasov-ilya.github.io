(() => {
  const feedRoot = document.getElementById("blog-feed");
  const moreButton = document.getElementById("blog-more");
  const refreshButton = document.getElementById("blog-refresh");
  const countEl = document.getElementById("blog-count");
  const updatedEl = document.getElementById("blog-updated");
  const yearEl = document.getElementById("year");
  let refreshLabelEl = null;

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  if (!feedRoot) {
    return;
  }

  const TELEGRAM_CHANNEL_URL = "https://t.me/nksvilya";
  const PAGE_SIZE = 6;
  const MAX_POSTS = 30;
  const RSS_SOURCES = [
    "https://rsshub.rssforever.com/telegram/channel/nksvilya",
    "https://rsshub.app/telegram/channel/nksvilya",
  ];

  let allPosts = [];
  let visibleCount = 0;

  const initRefreshButton = () => {
    if (!refreshButton) {
      return;
    }

    refreshButton.innerHTML = `
      <span class="material-symbols-outlined blog-refresh-icon" aria-hidden="true">sync</span>
      <span class="blog-refresh-label">Обновить</span>
    `;
    refreshLabelEl = refreshButton.querySelector(".blog-refresh-label");
  };

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const sanitizeUrl = (value) => {
    try {
      const raw = String(value ?? "").trim();
      if (!raw) {
        return "";
      }
      const normalized = raw.startsWith("//") ? `https:${raw}` : raw;
      const url = new URL(normalized, TELEGRAM_CHANNEL_URL);
      if (url.protocol === "http:" || url.protocol === "https:") {
        return url.toString();
      }
      return "";
    } catch (error) {
      return "";
    }
  };

  const parseHtml = (value) => {
    const parser = new DOMParser();
    return parser.parseFromString(String(value ?? ""), "text/html");
  };

  const stripHtml = (value) => {
    const doc = parseHtml(value);
    return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
  };

  const normalizeText = (value, fallback, maxLength) => {
    const text = String(value ?? "").trim();
    if (!text) {
      return fallback;
    }
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.slice(0, maxLength - 1).trimEnd()}...`;
  };

  const toDate = (value) => {
    if (!value) {
      return null;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const formatDate = (date) => {
    if (!(date instanceof Date)) {
      return "дата неизвестна";
    }
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!(date instanceof Date)) {
      return "-";
    }
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const estimateReadMinutes = (text) => {
    const words = text.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 190));
    return `${minutes} мин`;
  };

  const extractTags = (text) => {
    const matches = text.match(/#[A-Za-z0-9_\u0400-\u04FF]+/g) || [];
    return Array.from(new Set(matches)).slice(0, 4);
  };

  const extractImageFromHtml = (html) => {
    const doc = parseHtml(html);
    const img = doc.querySelector("img[src]");
    if (!img) {
      return "";
    }
    return sanitizeUrl(img.getAttribute("src"));
  };

  const extractImage = (item) => {
    const thumb = sanitizeUrl(item?.thumbnail);
    if (thumb) {
      return thumb;
    }

    const enclosure = sanitizeUrl(item?.enclosure?.link || item?.enclosure?.url);
    if (enclosure) {
      return enclosure;
    }

    const rawHtml = String(item?.description || item?.content || "");
    return extractImageFromHtml(rawHtml);
  };

  const isRealPost = (item) => {
    const title = stripHtml(item?.title || "");
    const lowered = title.toLowerCase();
    if (!title) {
      return false;
    }
    if (/pinned/.test(lowered) || /channel created/.test(lowered)) {
      return false;
    }
    return true;
  };

  const mapPost = (item) => {
    const rawTitle = stripHtml(item?.title || "");
    const rawHtml = String(item?.description || item?.content || "");
    const rawDescription = stripHtml(rawHtml);
    const tags = extractTags(rawDescription);
    const date = toDate(item?.pubDate);
    const link = sanitizeUrl(item?.link) || TELEGRAM_CHANNEL_URL;
    const image = extractImage(item);

    return {
      title: normalizeText(rawTitle, "Публикация", 120),
      excerpt: normalizeText(rawDescription, "Текст публикации недоступен.", 340),
      link,
      image,
      tags,
      date,
      dateLabel: formatDate(date),
      readLabel: estimateReadMinutes(rawDescription),
    };
  };

  const createCard = (post, index, entering = false) => {
    const isFeatured = index === 0;
    const cardClasses = ["panel", "blog-card"];
    if (isFeatured) {
      cardClasses.push("is-featured");
    }
    if (entering) {
      cardClasses.push("is-entering");
    }

    const media = post.image
      ? `<a class="blog-card-media" href="${escapeHtml(post.link)}" target="_blank" rel="noreferrer noopener"><img src="${escapeHtml(post.image)}" alt="" referrerpolicy="no-referrer"></a>`
      : "";
    const tags = post.tags.length
      ? `<ul class="blog-tags">${post.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}</ul>`
      : '<ul class="blog-tags"></ul>';

    return `
      <article class="${cardClasses.join(" ")}">
        ${media}
        <div class="blog-card-meta">
          <span class="blog-date">${escapeHtml(post.dateLabel)}</span>
          <span class="blog-read">${escapeHtml(post.readLabel)}</span>
        </div>
        <h3>${escapeHtml(post.title)}</h3>
        <p class="blog-excerpt">${escapeHtml(post.excerpt)}</p>
        <div class="blog-card-footer">
          ${tags}
          <a class="blog-link" href="${escapeHtml(post.link)}" target="_blank" rel="noreferrer noopener">Читать в Telegram</a>
        </div>
      </article>
    `;
  };

  const setRefreshState = (loading) => {
    if (!refreshButton) {
      return;
    }
    refreshButton.disabled = loading;
    refreshButton.classList.toggle("is-loading", loading);
    refreshButton.setAttribute("aria-busy", loading ? "true" : "false");
    if (refreshLabelEl) {
      refreshLabelEl.textContent = loading ? "Обновляю" : "Обновить";
    }
  };

  const updateStats = () => {
    if (countEl) {
      countEl.textContent = String(allPosts.length);
    }
    if (updatedEl) {
      updatedEl.textContent = formatDateTime(new Date());
    }
  };

  const updateMoreButton = () => {
    if (!moreButton) {
      return;
    }
    moreButton.hidden = visibleCount >= allPosts.length;
  };

  const animateFeedExpansion = (fromHeight, toHeight) => {
    if (toHeight <= fromHeight) {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    feedRoot.style.height = `${fromHeight}px`;
    feedRoot.style.overflow = "hidden";
    feedRoot.style.transition = "height 420ms cubic-bezier(0.22, 1, 0.36, 1)";

    window.requestAnimationFrame(() => {
      feedRoot.style.height = `${toHeight}px`;
    });

    window.setTimeout(() => {
      feedRoot.style.height = "";
      feedRoot.style.overflow = "";
      feedRoot.style.transition = "";
    }, 460);
  };

  const render = (previousCount = 0, animateNewCards = false) => {
    if (!allPosts.length) {
      feedRoot.innerHTML = `
        <article class="panel blog-status-card">
          <h3>Лента недоступна</h3>
          <p>Не удалось загрузить посты автоматически. Канал можно открыть напрямую.</p>
          <a class="blog-link" href="${TELEGRAM_CHANNEL_URL}" target="_blank" rel="noreferrer noopener">Открыть @nksvilya</a>
        </article>
      `;
      if (moreButton) {
        moreButton.hidden = true;
      }
      updateStats();
      return;
    }

    const visiblePosts = allPosts.slice(0, visibleCount);
    feedRoot.innerHTML = visiblePosts
      .map((post, index) => createCard(post, index, animateNewCards && index >= previousCount))
      .join("");

    updateStats();
    updateMoreButton();
  };

  const parseFeedPayload = (payload) => {
    if (!payload || payload.status !== "ok" || !Array.isArray(payload.items)) {
      return [];
    }

    return payload.items
      .filter(isRealPost)
      .map(mapPost)
      .sort((a, b) => {
        const aDate = a.date instanceof Date ? a.date.getTime() : 0;
        const bDate = b.date instanceof Date ? b.date.getTime() : 0;
        return bDate - aDate;
      })
      .slice(0, MAX_POSTS);
  };

  const fetchFromSource = async (sourceUrl) => {
    const endpoint = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(sourceUrl)}`;
    const response = await fetch(endpoint, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Feed request failed with status ${response.status}`);
    }
    const payload = await response.json();
    return parseFeedPayload(payload);
  };

  const loadPosts = async () => {
    for (const source of RSS_SOURCES) {
      try {
        const posts = await fetchFromSource(source);
        if (posts.length) {
          return posts;
        }
      } catch (error) {
        // Try next source.
      }
    }
    return [];
  };

  const refreshFeed = async () => {
    setRefreshState(true);
    if (moreButton) {
      moreButton.hidden = true;
    }

    const posts = await loadPosts();
    allPosts = posts;
    visibleCount = Math.min(PAGE_SIZE, allPosts.length);
    render(0, false);
    setRefreshState(false);
  };

  if (moreButton) {
    moreButton.addEventListener("click", () => {
      if (visibleCount >= allPosts.length) {
        moreButton.hidden = true;
        return;
      }

      const prevCount = visibleCount;
      const fromHeight = feedRoot.getBoundingClientRect().height;
      visibleCount = Math.min(visibleCount + PAGE_SIZE, allPosts.length);
      render(prevCount, true);
      const toHeight = feedRoot.getBoundingClientRect().height;
      animateFeedExpansion(fromHeight, toHeight);
    });
  }

  if (refreshButton) {
    refreshButton.addEventListener("click", refreshFeed);
  }

  initRefreshButton();
  refreshFeed();
})();
