import { dirname, resolve } from "node:path";
import { stat, writeFile } from "node:fs/promises";
import {
  decodeXmlEntities,
  ensureDir,
  hashValue,
  inferExtension,
  readJson,
  resolveRepoPath,
  sanitizeUrl,
  slugify,
  stripHtml,
  stripHtmlReadable,
  writeJson,
} from "./shared.mjs";

const TELEGRAM_CHANNEL_URL = "https://t.me/nksvilya";
const RSS_SOURCES = [
  "https://rsshub.rssforever.com/telegram/channel/nksvilya",
  "https://rsshub.app/telegram/channel/nksvilya",
];
const DEFAULT_MAX_POSTS = 12;
const MAX_POSTS = Number.parseInt(process.env.BLOG_MAX_POSTS ?? `${DEFAULT_MAX_POSTS}`, 10);
const SAFE_MAX_POSTS = Number.isFinite(MAX_POSTS) && MAX_POSTS > 0 ? MAX_POSTS : DEFAULT_MAX_POSTS;
const BLOG_IMAGE_DIRECTORY = resolveRepoPath("public", "content", "blog");
const OUTPUT_PATH = resolveRepoPath(
  "src",
  "entities",
  "content",
  "model",
  "generated",
  "blog-posts.json",
);
const SECTION_MARKER_PATTERN =
  /\s+(?=(?:\u{1F7E1}|\u{1F538}|\u{1F539}|\u{2705}|\u{2757}|\u26A0\uFE0F|\u2022))/gu;
const INLINE_DASH_LIST_INTRO_PATTERN = /([:：])\s+(?=[\u2014\u2013-]\s+\p{L})/gu;
const INLINE_DASH_LIST_ITEM_PATTERN = /\s+(?=[\u2014\u2013-]\s+\p{L}[^.\n]{0,48}[:：])/gu;
const TRAILING_HASHTAGS_PATTERN = /\s*(?:#[A-Za-z0-9_\u0400-\u04FF]+\s*){2,}$/u;

function normalizeSpaces(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeBlockSpacing(value) {
  return String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/\u00A0/g, " ")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function escapeRegExp(value) {
  return String(value ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripLeadingDecoratorsInline(value) {
  return normalizeSpaces(value).replace(/^[^\p{L}\p{N}]+/u, "");
}

function stripLeadingDecoratorsBlock(value) {
  return normalizeBlockSpacing(value).replace(/^[^\p{L}\p{N}]+/u, "");
}

function stripTrailingHashtags(value) {
  return normalizeBlockSpacing(value).replace(TRAILING_HASHTAGS_PATTERN, "").trim();
}

function stripLeadingDuplicatedTitle(content, title) {
  const normalizedContent = normalizeBlockSpacing(content);
  const normalizedTitle = normalizeSpaces(title);

  if (!normalizedContent || !normalizedTitle) {
    return normalizedContent;
  }

  const contentCore = stripLeadingDecoratorsBlock(normalizedContent);
  const titleCore = stripLeadingDecoratorsInline(normalizedTitle);

  if (!contentCore || !titleCore) {
    return normalizedContent;
  }

  const escapedTitle = escapeRegExp(titleCore).replace(/\s+/g, "\\s+");
  const duplicatedTitlePattern = new RegExp(
    `^${escapedTitle}(?:[\\s\\-\\u2013\\u2014:|.,;!?"'()\\u00AB\\u00BB]+)?`,
    "iu",
  );

  const strippedContent = contentCore.replace(duplicatedTitlePattern, "").trim();
  return strippedContent || normalizedContent;
}

function formatReadableText(value) {
  const normalized = String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(SECTION_MARKER_PATTERN, "\n\n")
    .replace(INLINE_DASH_LIST_INTRO_PATTERN, "$1\n\n")
    .replace(INLINE_DASH_LIST_ITEM_PATTERN, "\n\n");

  const lines = normalized
    .split("\n")
    .map((line) =>
      line
        .replace(/[ \t]+/g, " ")
        .replace(/\s+([,.;!?:])/g, "$1")
        .replace(/\(\s+/g, "(")
        .replace(/\s+\)/g, ")")
        .trim(),
    )
    .join("\n");

  return lines.replace(/\n{3,}/g, "\n\n").trim();
}

function normalizeText(value, fallback, maxLength) {
  const cleaned = String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");

  if (!cleaned) {
    return fallback;
  }

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, maxLength - 1).trimEnd()}…`;
}

function extractTags(text) {
  const matches = String(text ?? "").match(/#[A-Za-z0-9_\u0400-\u04FF]+/g) ?? [];
  return Array.from(new Set(matches)).slice(0, 4);
}

function extractTag(block, tagName) {
  const match = block.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match ? decodeXmlEntities(match[1]).trim() : "";
}

function extractImage(block, descriptionHtml) {
  const enclosureMatch = block.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*>/i);
  if (enclosureMatch) {
    return sanitizeUrl(enclosureMatch[1], "");
  }

  const imageMatch = descriptionHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
  return imageMatch ? sanitizeUrl(imageMatch[1], "") : "";
}

function isRealPost(title) {
  const lowered = title.toLowerCase();
  return Boolean(title) && !/pinned/.test(lowered) && !/channel created/.test(lowered);
}

function toTimestamp(value) {
  if (!value) {
    return 0;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function persistImage(imageUrl, postId, title) {
  if (!imageUrl) {
    return "";
  }

  const fileStem = `${postId}-${slugify(title, postId)}`;
  const guessedExtension = inferExtension(imageUrl);
  const guessedPath = resolve(BLOG_IMAGE_DIRECTORY, `${fileStem}${guessedExtension}`);
  const guessedPublicPath = `/content/blog/${fileStem}${guessedExtension}`;

  if (await fileExists(guessedPath)) {
    return guessedPublicPath;
  }

  const response = await fetch(imageUrl, {
    headers: {
      Referer: TELEGRAM_CHANNEL_URL,
      "User-Agent": "nksv-portfolio-content-sync",
    },
  });

  if (!response.ok) {
    throw new Error(`Image fetch failed (${response.status})`);
  }

  const extension = inferExtension(imageUrl, response.headers.get("content-type") ?? "");
  const filePath = resolve(BLOG_IMAGE_DIRECTORY, `${fileStem}${extension}`);
  const publicPath = `/content/blog/${fileStem}${extension}`;

  if (!(await fileExists(filePath))) {
    await ensureDir(dirname(filePath));
    await writeFile(filePath, Buffer.from(await response.arrayBuffer()));
  }

  return publicPath;
}

function mapPost(item, index) {
  const rawTitle = stripHtml(item.title);
  const titleSource = stripLeadingDecoratorsInline(rawTitle) || rawTitle;
  const rawDescription = stripHtmlReadable(item.description);
  const descriptionSource = stripLeadingDecoratorsBlock(rawDescription) || rawDescription;
  const contentWithoutTitle = stripLeadingDuplicatedTitle(descriptionSource, titleSource);
  const contentWithoutTrailingTags = stripTrailingHashtags(contentWithoutTitle);
  const content = formatReadableText(contentWithoutTrailingTags);
  const link = sanitizeUrl(item.link, TELEGRAM_CHANNEL_URL);
  const idSource = item.guid || link || `${rawTitle}-${index}`;

  return {
    id: `${hashValue(idSource)}-${index + 1}`,
    title: normalizeText(titleSource, "Публикация", 120),
    excerpt: normalizeText(content, "Текст публикации недоступен.", 340),
    content: content || "Текст публикации недоступен.",
    link,
    imageSource: extractImage(item.raw, item.description),
    tags: extractTags(descriptionSource || rawDescription || item.description),
    publishedAt: item.pubDate || "",
  };
}

function parseRss(xmlText) {
  const items = Array.from(xmlText.matchAll(/<item>([\s\S]*?)<\/item>/gi)).map((match) => {
    const block = match[1];
    return {
      raw: block,
      title: extractTag(block, "title"),
      link: extractTag(block, "link"),
      guid: extractTag(block, "guid"),
      pubDate: extractTag(block, "pubDate"),
      description: extractTag(block, "description"),
    };
  });

  return items
    .filter((item) => isRealPost(item.title))
    .map(mapPost)
    .sort((left, right) => toTimestamp(right.publishedAt) - toTimestamp(left.publishedAt))
    .slice(0, SAFE_MAX_POSTS);
}

async function fetchFromSource(source) {
  const response = await fetch(source, {
    headers: {
      Accept: "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.7",
      "User-Agent": "nksv-portfolio-content-sync",
    },
  });

  if (!response.ok) {
    throw new Error(`Feed request failed (${response.status})`);
  }

  const xml = await response.text();
  return parseRss(xml);
}

async function loadPosts() {
  for (const source of RSS_SOURCES) {
    try {
      const posts = await fetchFromSource(source);
      if (posts.length > 0) {
        console.log(`Fetched ${posts.length} Telegram posts from ${source}`);
        return posts;
      }
    } catch (error) {
      console.warn(`Telegram source failed ${source}: ${error.message}`);
    }
  }

  return [];
}

export async function runTelegramPostSync() {
  try {
    const posts = await loadPosts();
    if (posts.length === 0) {
      throw new Error("Telegram feed returned no posts");
    }

    const savedPosts = [];

    for (const post of posts) {
      let image = "";

      try {
        image = await persistImage(post.imageSource, post.id, post.title);
      } catch (error) {
        console.warn(`Image sync skipped for "${post.title}": ${error.message}`);
      }

      savedPosts.push({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        link: post.link,
        image,
        tags: post.tags,
        publishedAt: post.publishedAt,
      });
    }

    await writeJson(OUTPUT_PATH, {
      generatedAt: new Date().toISOString(),
      channelUrl: TELEGRAM_CHANNEL_URL,
      posts: savedPosts,
    });
    console.log(`Saved ${savedPosts.length} Telegram posts to generated data.`);
  } catch (error) {
    const existing = await readJson(OUTPUT_PATH, { posts: [] });
    if (Array.isArray(existing?.posts) && existing.posts.length > 0) {
      console.warn(
        `Telegram sync skipped: ${error.message}. Reusing ${existing.posts.length} saved posts.`,
      );
      return;
    }

    throw error;
  }
}
