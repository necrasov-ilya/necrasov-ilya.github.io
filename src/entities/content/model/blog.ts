import blogPostsPayload from './generated/blog-posts.json';
import { estimateReadLabel, formatDateRu } from './format';

interface GeneratedBlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  link: string;
  image: string;
  tags: string[];
  publishedAt: string;
}

interface GeneratedBlogPayload {
  generatedAt: string;
  channelUrl: string;
  posts: GeneratedBlogPost[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  previewExcerpt: string;
  content: string;
  paragraphs: string[];
  link: string;
  image: string;
  tags: string[];
  publishedAt: string;
  publishedLabel: string;
  readLabel: string;
}

const typedPayload = blogPostsPayload as GeneratedBlogPayload;

export const blogGeneratedAt = typedPayload.generatedAt;
export const telegramChannelUrl = typedPayload.channelUrl;

function compactExcerpt(title: string, excerpt: string) {
  const normalizedExcerpt = excerpt.trim().replace(/\s+/g, ' ');

  if (!normalizedExcerpt) {
    return '';
  }

  const escapedTitle = title.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  if (!escapedTitle) {
    return normalizedExcerpt;
  }

  const leadingTitlePattern = new RegExp(`^${escapedTitle}[\\s—–\\-:,.!?«»"()]*`, 'i');
  const compact = normalizedExcerpt.replace(leadingTitlePattern, '').trim();

  return compact || normalizedExcerpt;
}

export const blogPosts: BlogPost[] = typedPayload.posts.map((post) => ({
  ...post,
  previewExcerpt: compactExcerpt(post.title, post.excerpt),
  paragraphs: post.content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean),
  publishedLabel: formatDateRu(post.publishedAt),
  readLabel: estimateReadLabel(post.content),
}));
