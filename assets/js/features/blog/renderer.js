import { escapeHtml, sanitizeUrl } from "../../shared/format.js";

const FALLBACK_CONTENT = "Текст публикации недоступен.";
const PARAGRAPH_TARGET_LENGTH = 420;
const PARAGRAPH_MIN_LENGTH = 220;

const splitChunkBySentences = (chunk) => {
  const normalizedChunk = String(chunk ?? "")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalizedChunk) {
    return [];
  }

  if (normalizedChunk.length <= PARAGRAPH_TARGET_LENGTH) {
    return [normalizedChunk];
  }

  const sentences = normalizedChunk
    .match(/[^.!?]+(?:[.!?]+|$)/g)
    ?.map((sentence) => sentence.trim())
    .filter(Boolean) || [normalizedChunk];

  const paragraphs = [];
  let currentParagraph = "";

  sentences.forEach((sentence) => {
    const candidate = currentParagraph ? `${currentParagraph} ${sentence}` : sentence;

    if (
      candidate.length > PARAGRAPH_TARGET_LENGTH &&
      currentParagraph.length >= PARAGRAPH_MIN_LENGTH
    ) {
      paragraphs.push(currentParagraph.trim());
      currentParagraph = sentence;
      return;
    }

    currentParagraph = candidate;
  });

  if (currentParagraph) {
    paragraphs.push(currentParagraph.trim());
  }

  if (paragraphs.length === 1 && normalizedChunk.length > PARAGRAPH_TARGET_LENGTH * 1.35) {
    const midpoint = Math.floor(normalizedChunk.length / 2);
    const splitPoint = normalizedChunk.indexOf(" ", midpoint);

    if (splitPoint > 0) {
      return [
        normalizedChunk.slice(0, splitPoint).trim(),
        normalizedChunk.slice(splitPoint + 1).trim(),
      ];
    }
  }

  return paragraphs;
};

const createContentMarkup = (text) => {
  const chunks = String(text ?? "")
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const paragraphs = chunks.flatMap(splitChunkBySentences);

  if (paragraphs.length === 0) {
    return `<p class="blog-content-paragraph">${escapeHtml(FALLBACK_CONTENT)}</p>`;
  }

  return paragraphs
    .map((paragraph) => `<p class="blog-content-paragraph">${escapeHtml(paragraph)}</p>`)
    .join("");
};

const createBlogCard = (post, index, entering = false) => {
  const isFeatured = index === 0;
  const cardClasses = ["panel", "blog-card"];

  if (isFeatured) {
    cardClasses.push("is-featured");
  }

  if (entering) {
    cardClasses.push("is-entering");
  }

  const link = sanitizeUrl(post?.link, { fallback: "#" });
  const image = sanitizeUrl(post?.image, { fallback: "" });

  const media = image
    ? `<a class="blog-card-media" href="${link}" target="_blank" rel="noreferrer noopener"><img src="${image}" alt="" referrerpolicy="no-referrer"></a>`
    : "";

  const tags =
    Array.isArray(post?.tags) && post.tags.length
      ? `<ul class="blog-tags">${post.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}</ul>`
      : '<ul class="blog-tags"></ul>';

  const excerpt = escapeHtml(post?.excerpt || FALLBACK_CONTENT);
  const contentRaw = String(post?.content || post?.excerpt || FALLBACK_CONTENT).trim();
  const hasInlineContent = Boolean(contentRaw);

  return `
    <article class="${cardClasses.join(" ")}" data-blog-index="${index}">
      ${media}
      <div class="blog-card-meta">
        <span class="blog-date">${escapeHtml(post?.dateLabel)}</span>
        <span class="blog-read">${escapeHtml(post?.readLabel)}</span>
      </div>
      <h3>${escapeHtml(post?.title)}</h3>
      <p class="blog-excerpt">${excerpt}</p>
      <div class="blog-content-wrap" data-blog-content aria-hidden="true"${hasInlineContent ? "" : " hidden"}>
        <div class="blog-content-inner">
          <div class="blog-content">${createContentMarkup(contentRaw)}</div>
        </div>
      </div>
      <div class="blog-card-footer">
        ${tags}
        <div class="blog-card-links">
          <a class="blog-link" href="${link}" target="_blank" rel="noreferrer noopener">Читать в Telegram</a>
          <button class="blog-inline-toggle" type="button" data-blog-read-toggle aria-expanded="false"${hasInlineContent ? "" : " hidden"}>Прочитать здесь</button>
        </div>
      </div>
    </article>
  `;
};

const createBlogCardsMarkup = (posts, { startIndex = 0, entering = false } = {}) =>
  posts.map((post, offset) => createBlogCard(post, startIndex + offset, entering)).join("");

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

export const renderBlogPostsReplace = ({ root, posts }) => {
  root.innerHTML = createBlogCardsMarkup(posts, { startIndex: 0, entering: false });
};

export const renderBlogPostsAppend = ({ root, posts, startIndex = 0 }) => {
  if (!Array.isArray(posts) || posts.length === 0) {
    return;
  }

  root.insertAdjacentHTML(
    "beforeend",
    createBlogCardsMarkup(posts, {
      startIndex,
      entering: true,
    }),
  );
};
