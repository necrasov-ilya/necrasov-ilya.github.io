import { escapeHtml } from "../../shared/format.js";

const createBlogCard = (post, index, entering = false) => {
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

export const renderBlogUnavailable = (root, channelUrl) => {
  root.innerHTML = `
    <article class="panel blog-status-card">
      <h3>Лента недоступна</h3>
      <p>Не удалось загрузить посты автоматически. Канал можно открыть напрямую.</p>
      <a class="blog-link" href="${escapeHtml(channelUrl)}" target="_blank" rel="noreferrer noopener">Открыть @nksvilya</a>
    </article>
  `;
};

export const renderBlogLoading = (root) => {
  root.innerHTML = `
    <article class="panel blog-status-card">
      <h3>Загрузка</h3>
      <p>Собираю посты из канала...</p>
    </article>
  `;
};

export const renderBlogPosts = ({
  root,
  posts,
  visibleCount,
  previousCount = 0,
  animateNewCards = false,
}) => {
  const visiblePosts = posts.slice(0, visibleCount);

  root.innerHTML = visiblePosts
    .map((post, index) => createBlogCard(post, index, animateNewCards && index >= previousCount))
    .join("");
};

export const setMoreButtonState = ({ button, visibleCount, totalCount }) => {
  if (!button) {
    return;
  }

  button.hidden = visibleCount >= totalCount;
};

export const animateFeedExpansion = ({ root, fromHeight, toHeight }) => {
  if (toHeight <= fromHeight) {
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  root.style.height = `${fromHeight}px`;
  root.style.overflow = "hidden";
  root.style.transition = "height 420ms cubic-bezier(0.22, 1, 0.36, 1)";

  window.requestAnimationFrame(() => {
    root.style.height = `${toHeight}px`;
  });

  window.setTimeout(() => {
    root.style.height = "";
    root.style.overflow = "";
    root.style.transition = "";
  }, 460);
};
