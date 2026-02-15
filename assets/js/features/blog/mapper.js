import {
  estimateReadMinutes,
  formatDateRu,
  normalizeText,
  sanitizeUrl,
  stripHtml,
  toDate,
} from "../../shared/format.js";

export const TELEGRAM_CHANNEL_URL = "https://t.me/nksvilya";
export const BLOG_PAGE_SIZE = 6;
const BLOG_MAX_POSTS = 30;

const extractTags = (text) => {
  const matches = String(text ?? "").match(/#[A-Za-z0-9_\u0400-\u04FF]+/g) || [];
  return Array.from(new Set(matches)).slice(0, 4);
};

const normalizeTags = (tags, fallbackSource) => {
  if (Array.isArray(tags) && tags.length > 0) {
    return Array.from(new Set(tags.map((item) => String(item).trim()).filter(Boolean))).slice(0, 4);
  }
  return extractTags(fallbackSource);
};

const mapPost = (item, index) => {
  const rawTitle = stripHtml(item?.title || "");
  const rawExcerpt = stripHtml(item?.excerpt || item?.description || "");
  const publishedAt = toDate(item?.publishedAt || item?.date || item?.pubDate);

  const title = normalizeText(rawTitle, "Публикация", 120);
  const excerpt = normalizeText(rawExcerpt, "Текст публикации недоступен.", 340);
  const link = sanitizeUrl(item?.link, {
    base: TELEGRAM_CHANNEL_URL,
    fallback: TELEGRAM_CHANNEL_URL,
  });
  const image = sanitizeUrl(item?.image, {
    base: TELEGRAM_CHANNEL_URL,
    fallback: "",
  });
  const tags = normalizeTags(item?.tags, rawExcerpt);

  return {
    id: String(item?.id || link || `post-${index + 1}`),
    title,
    excerpt,
    link,
    image,
    tags,
    date: publishedAt,
    dateLabel: formatDateRu(publishedAt),
    readLabel: estimateReadMinutes(rawExcerpt),
  };
};

export const normalizeBlogPosts = (payload) => {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map(mapPost)
    .sort((left, right) => {
      const leftDate = left.date instanceof Date ? left.date.getTime() : 0;
      const rightDate = right.date instanceof Date ? right.date.getTime() : 0;
      return rightDate - leftDate;
    })
    .slice(0, BLOG_MAX_POSTS);
};
