import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RSS_SOURCES = [
  "https://rsshub.rssforever.com/telegram/channel/nksvilya",
  "https://rsshub.app/telegram/channel/nksvilya",
];

const TELEGRAM_CHANNEL_URL = "https://t.me/nksvilya";
const DEFAULT_MAX_POSTS = 120;
const MAX_POSTS = Number.parseInt(process.env.BLOG_MAX_POSTS ?? `${DEFAULT_MAX_POSTS}`, 10);
const SAFE_MAX_POSTS = Number.isFinite(MAX_POSTS) && MAX_POSTS > 0 ? MAX_POSTS : DEFAULT_MAX_POSTS;

const SECTION_MARKER_PATTERN =
  /\s+(?=(?:\u{1F7E1}|\u{1F538}|\u{1F539}|\u{2705}|\u{2757}|\u26A0\uFE0F|\u2022))/gu;
const TRAILING_HASHTAGS_PATTERN = /\s*(?:#[A-Za-z0-9_\u0400-\u04FF]+\s*){2,}$/u;

const currentDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(currentDir, "..");
const outputPath = resolve(repoRoot, "assets", "data", "blog-posts.json");

const decodeXmlEntities = (value) =>
  String(value ?? "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-fA-F]+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));

const stripHtml = (value) =>
  decodeXmlEntities(value)
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const stripHtmlReadable = (value) =>
  decodeXmlEntities(value)
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\u2022 ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const normalizeText = (value, fallback, maxLength) => {
  const cleaned = String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");

  if (!cleaned) {
    return fallback;
  }

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, maxLength - 1).trimEnd()}...`;
};

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

const sanitizeUrl = (value, fallback = "") => {
  try {
    const raw = String(value ?? "").trim();
    if (!raw) {
      return fallback;
    }

    const normalized = raw.startsWith("//") ? `https:${raw}` : raw;
    const parsed = new URL(normalized, TELEGRAM_CHANNEL_URL);

    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }

    return fallback;
  } catch {
    return fallback;
  }
};

const extractTags = (text) => {
  const matches = String(text ?? "").match(/#[A-Za-z0-9_\u0400-\u04FF]+/g) || [];
  return Array.from(new Set(matches)).slice(0, 4);
};

const extractTag = (block, tagName) => {
  const match = block.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match ? decodeXmlEntities(match[1]).trim() : "";
};

const extractImage = (block, descriptionHtml) => {
  const enclosureMatch = block.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*>/i);
  if (enclosureMatch) {
    const enclosureUrl = sanitizeUrl(enclosureMatch[1], "");
    if (enclosureUrl) {
      return enclosureUrl;
    }
  }

  const imageMatch = descriptionHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imageMatch) {
    return sanitizeUrl(imageMatch[1], "");
  }

  return "";
};

const isRealPost = (title) => {
  const lowered = title.toLowerCase();

  if (!title) {
    return false;
  }

  if (/pinned/.test(lowered) || /channel created/.test(lowered)) {
    return false;
  }

  return true;
};

const hashValue = (value) => {
  const text = String(value ?? "");
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
};

const toTimestamp = (value) => {
  if (!value) {
    return 0;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const mapPost = (item, index) => {
  const rawTitle = stripHtml(item.title);
  const titleSource = stripLeadingDecorators(rawTitle) || rawTitle;

  const rawDescription = stripHtmlReadable(item.description);
  const descriptionSource = stripLeadingDecorators(rawDescription) || rawDescription;
  const contentWithoutDuplicatedTitle = stripLeadingDuplicatedTitle(descriptionSource, titleSource);
  const contentWithoutTrailingTags = stripTrailingHashtagBlock(contentWithoutDuplicatedTitle);
  const fullContent = formatReadableText(contentWithoutTrailingTags);

  const link = sanitizeUrl(item.link, TELEGRAM_CHANNEL_URL);
  const publishedAt = item.pubDate || null;
  const idSource = item.guid || link || `${rawTitle}-${index}`;

  return {
    id: `${hashValue(idSource)}-${index + 1}`,
    title: normalizeText(titleSource, "Публикация", 120),
    excerpt: normalizeText(fullContent, "Текст публикации недоступен.", 340),
    content: fullContent || "Текст публикации недоступен.",
    link,
    image: extractImage(item.raw, item.description),
    tags: extractTags(descriptionSource || rawDescription || item.description),
    publishedAt,
  };
};

const parseRss = (xmlText) => {
  const itemBlocks = Array.from(xmlText.matchAll(/<item>([\s\S]*?)<\/item>/gi)).map(
    (match) => match[1],
  );

  return itemBlocks
    .map((block) => ({
      raw: block,
      title: extractTag(block, "title"),
      link: extractTag(block, "link"),
      guid: extractTag(block, "guid"),
      pubDate: extractTag(block, "pubDate"),
      description: extractTag(block, "description"),
    }))
    .filter((item) => isRealPost(item.title))
    .map(mapPost)
    .sort((left, right) => toTimestamp(right.publishedAt) - toTimestamp(left.publishedAt))
    .slice(0, SAFE_MAX_POSTS);
};

const fetchFromSource = async (source) => {
  const response = await fetch(source, {
    headers: {
      Accept: "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.7",
    },
  });

  if (!response.ok) {
    throw new Error(`Feed request failed (${response.status})`);
  }

  const xml = await response.text();
  return parseRss(xml);
};

const loadPosts = async () => {
  for (const source of RSS_SOURCES) {
    try {
      const posts = await fetchFromSource(source);
      if (posts.length > 0) {
        console.log(`Fetched ${posts.length} posts from ${source}`);
        return posts;
      }
    } catch (error) {
      console.warn(`Failed source ${source}: ${error.message}`);
    }
  }

  return [];
};

const loadExistingPosts = async () => {
  if (!existsSync(outputPath)) {
    return [];
  }

  try {
    const raw = await readFile(outputPath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writePosts = async (posts) => {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(posts, null, 2)}\n`, "utf8");
};

const run = async () => {
  const fetchedPosts = await loadPosts();

  if (fetchedPosts.length > 0) {
    await writePosts(fetchedPosts);
    console.log(`Saved ${fetchedPosts.length} blog posts to assets/data/blog-posts.json`);
    return;
  }

  const existingPosts = await loadExistingPosts();

  if (existingPosts.length > 0) {
    await writePosts(existingPosts);
    console.warn(
      `RSS fetch unavailable. Reused existing dataset with ${existingPosts.length} posts.`,
    );
    return;
  }

  await writePosts([]);
  console.warn("RSS fetch unavailable and no existing dataset found. Saved an empty blog dataset.");
};

run().catch((error) => {
  console.error(`Blog prebuild failed: ${error.message}`);
  process.exitCode = 1;
});
