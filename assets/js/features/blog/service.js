import { normalizeBlogPosts } from "./mapper.js";

const BLOG_DATA_URL = "assets/data/blog-posts.json";
const CACHE_KEY = "necrasov_blog_cache_v3";
const CACHE_TTL_MS = 1000 * 60 * 15;
const REQUEST_TIMEOUT_MS = 8000;

const readCache = ({ maxPosts } = {}) => {
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.posts) || typeof parsed.savedAt !== "number") {
      return [];
    }

    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) {
      return [];
    }

    return normalizeBlogPosts(parsed.posts, { maxPosts });
  } catch {
    return [];
  }
};

const writeCache = (posts) => {
  try {
    window.sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        savedAt: Date.now(),
        posts,
      }),
    );
  } catch {
    // Ignore storage errors.
  }
};

const fetchJsonWithTimeout = async (url, timeoutMs) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Blog data request failed with status ${response.status}`);
    }

    return await response.json();
  } finally {
    window.clearTimeout(timeoutId);
  }
};

export const fetchBlogPosts = async ({
  dataUrl = BLOG_DATA_URL,
  maxPosts,
  timeoutMs = REQUEST_TIMEOUT_MS,
} = {}) => {
  const cachedPosts = readCache({ maxPosts });

  try {
    const payload = await fetchJsonWithTimeout(dataUrl, timeoutMs);
    const posts = normalizeBlogPosts(payload, { maxPosts });

    if (posts.length > 0) {
      writeCache(posts);
      return posts;
    }
  } catch {
    if (cachedPosts.length > 0) {
      return cachedPosts;
    }

    throw new Error("Unable to fetch blog posts");
  }

  if (cachedPosts.length > 0) {
    return cachedPosts;
  }

  return [];
};
