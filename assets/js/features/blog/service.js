import { normalizeBlogPosts } from "./mapper.js";

const BLOG_DATA_URL = "assets/data/blog-posts.json";

export const fetchBlogPosts = async ({ dataUrl = BLOG_DATA_URL } = {}) => {
  const response = await fetch(dataUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Blog data request failed with status ${response.status}`);
  }

  const payload = await response.json();
  return normalizeBlogPosts(payload);
};
