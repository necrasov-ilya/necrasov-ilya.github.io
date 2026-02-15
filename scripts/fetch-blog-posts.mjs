import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RSS_SOURCES = [
  "https://rsshub.rssforever.com/telegram/channel/nksvilya",
  "https://rsshub.app/telegram/channel/nksvilya",
];

const TELEGRAM_CHANNEL_URL = "https://t.me/nksvilya";
const MAX_POSTS = 30;

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
  const matches = text.match(/#[A-Za-z0-9_\u0400-\u04FF]+/g) || [];
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
  const rawDescription = stripHtml(item.description);
  const link = sanitizeUrl(item.link, TELEGRAM_CHANNEL_URL);
  const publishedAt = item.pubDate || null;
  const idSource = item.guid || link || `${rawTitle}-${index}`;

  return {
    id: `${hashValue(idSource)}-${index + 1}`,
    title: normalizeText(rawTitle, "Публикация", 120),
    excerpt: normalizeText(rawDescription, "Текст публикации недоступен.", 340),
    link,
    image: extractImage(item.raw, item.description),
    tags: extractTags(rawDescription),
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
    .slice(0, MAX_POSTS);
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
