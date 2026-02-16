import {
  estimateReadMinutes,
  formatDateRu,
  normalizeText,
  sanitizeUrl,
  stripHtml,
  toDate,
} from "../../shared/format.js";

export const TELEGRAM_CHANNEL_URL = "https://t.me/nksvilya";

const DEFAULT_BLOG_MAX_POSTS = 120;
const EXCERPT_MAX_LENGTH = 340;
const FALLBACK_TITLE = "Публикация";
const FALLBACK_CONTENT = "Текст публикации недоступен.";

const SECTION_MARKER_PATTERN =
  /\s+(?=(?:\u{1F7E1}|\u{1F538}|\u{1F539}|\u{2705}|\u{2757}|\u26A0\uFE0F|\u2022))/gu;
const TRAILING_HASHTAGS_PATTERN = /\s*(?:#[A-Za-z0-9_\u0400-\u04FF]+\s*){2,}$/u;

const normalizeSpaces = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");

const escapeRegExp = (value) => String(value ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const stripLeadingDecorators = (value) => normalizeSpaces(value).replace(/^[^\p{L}\p{N}]+/u, "");

const stripTrailingHashtagBlock = (value) =>
  normalizeSpaces(value).replace(TRAILING_HASHTAGS_PATTERN, "").trim();

const stripLeadingDuplicatedTitle = (content, title) => {
  const normalizedContent = normalizeSpaces(content);
  const normalizedTitle = normalizeSpaces(title);

  if (!normalizedContent || !normalizedTitle) {
    return normalizedContent;
  }

  const contentCore = stripLeadingDecorators(normalizedContent);
  const titleCore = stripLeadingDecorators(normalizedTitle);

  if (!contentCore || !titleCore) {
    return normalizedContent;
  }

  const escapedTitle = escapeRegExp(titleCore).replace(/\s+/g, "\\s+");
  const duplicatedTitlePattern = new RegExp(
    `^${escapedTitle}(?:[\\s\\-\\u2013\\u2014:|.,;!?"'()\\u00AB\\u00BB]+)?`,
    "iu",
  );

  const strippedContent = contentCore.replace(duplicatedTitlePattern, "").trim();

  if (!strippedContent) {
    return normalizedContent;
  }

  return strippedContent;
};

const formatReadableText = (value) => {
  const normalized = String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(SECTION_MARKER_PATTERN, "\n\n")
    .replace(/\s+\u2014\s+/g, "\n\n\u2014 ");

  const lines = normalized
    .split("\n")
    .map((line) =>
      line
        .replace(/[ \t]+/g, " ")
        .replace(/\s+([,.;!?])/g, "$1")
        .replace(/\(\s+/g, "(")
        .replace(/\s+\)/g, ")")
        .trim(),
    )
    .join("\n");

  return lines.replace(/\n{3,}/g, "\n\n").trim();
};

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
  const titleSource = stripLeadingDecorators(rawTitle) || rawTitle;

  const rawContent = String(item?.content || item?.description || item?.excerpt || "");
  const contentText = item?.content ? rawContent : stripHtml(rawContent);
  const contentSource = stripLeadingDecorators(contentText) || contentText;
  const contentWithoutDuplicatedTitle = stripLeadingDuplicatedTitle(contentSource, titleSource);
  const contentWithoutTrailingTags = stripTrailingHashtagBlock(contentWithoutDuplicatedTitle);
  const formattedContent = formatReadableText(contentWithoutTrailingTags);

  const title = normalizeText(titleSource, FALLBACK_TITLE, 120);
  const content = formattedContent || FALLBACK_CONTENT;
  const excerpt = normalizeText(normalizeSpaces(content), FALLBACK_CONTENT, EXCERPT_MAX_LENGTH);
  const publishedAt = toDate(item?.publishedAt || item?.date || item?.pubDate);

  const link = sanitizeUrl(item?.link, {
    base: TELEGRAM_CHANNEL_URL,
    fallback: TELEGRAM_CHANNEL_URL,
  });
  const image = sanitizeUrl(item?.image, {
    base: TELEGRAM_CHANNEL_URL,
    fallback: "",
  });
  const tags = normalizeTags(item?.tags, contentText || rawContent);

  return {
    id: String(item?.id || link || `post-${index + 1}`),
    title,
    excerpt,
    content,
    link,
    image,
    tags,
    date: publishedAt,
    dateLabel: formatDateRu(publishedAt),
    readLabel: estimateReadMinutes(formattedContent || contentSource || rawContent),
  };
};

export const normalizeBlogPosts = (payload, { maxPosts = DEFAULT_BLOG_MAX_POSTS } = {}) => {
  if (!Array.isArray(payload)) {
    return [];
  }

  const safeMaxPosts =
    typeof maxPosts === "number" && Number.isFinite(maxPosts) && maxPosts > 0
      ? Math.trunc(maxPosts)
      : DEFAULT_BLOG_MAX_POSTS;

  return payload
    .map(mapPost)
    .sort((left, right) => {
      const leftDate = left.date instanceof Date ? left.date.getTime() : 0;
      const rightDate = right.date instanceof Date ? right.date.getTime() : 0;
      return rightDate - leftDate;
    })
    .slice(0, safeMaxPosts);
};
