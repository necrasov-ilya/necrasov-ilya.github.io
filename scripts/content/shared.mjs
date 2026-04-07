import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));

export const repoRoot = resolve(currentDir, "..", "..");

export function resolveRepoPath(...segments) {
  return resolve(repoRoot, ...segments);
}

export async function ensureDir(targetPath) {
  await mkdir(targetPath, { recursive: true });
}

export async function readJson(filePath, fallback) {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function writeJson(filePath, payload) {
  await ensureDir(dirname(filePath));
  await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

export function hashValue(value) {
  return createHash("sha1").update(String(value ?? "")).digest("hex").slice(0, 12);
}

export function slugify(value, fallback = "entry") {
  const latinized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/ё/g, "e")
    .replace(/й/g, "i")
    .replace(/ц/g, "cz")
    .replace(/у/g, "u")
    .replace(/к/g, "k")
    .replace(/е/g, "e")
    .replace(/н/g, "n")
    .replace(/г/g, "g")
    .replace(/ш/g, "sh")
    .replace(/щ/g, "sch")
    .replace(/з/g, "z")
    .replace(/х/g, "h")
    .replace(/ъ/g, "")
    .replace(/ф/g, "f")
    .replace(/ы/g, "y")
    .replace(/в/g, "v")
    .replace(/а/g, "a")
    .replace(/п/g, "p")
    .replace(/р/g, "r")
    .replace(/о/g, "o")
    .replace(/л/g, "l")
    .replace(/д/g, "d")
    .replace(/ж/g, "zh")
    .replace(/э/g, "e")
    .replace(/я/g, "ya")
    .replace(/ч/g, "ch")
    .replace(/с/g, "s")
    .replace(/м/g, "m")
    .replace(/и/g, "i")
    .replace(/т/g, "t")
    .replace(/ь/g, "")
    .replace(/б/g, "b")
    .replace(/ю/g, "yu");

  const cleaned = latinized
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return cleaned || fallback;
}

export function decodeXmlEntities(value) {
  return String(value ?? "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-fA-F]+);/g, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    );
}

export function stripHtml(value) {
  return decodeXmlEntities(value)
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function stripHtmlReadable(value) {
  return decodeXmlEntities(value)
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function sanitizeUrl(value, fallback = "") {
  try {
    const raw = String(value ?? "").trim();
    if (!raw) {
      return fallback;
    }

    const normalized = raw.startsWith("//") ? `https:${raw}` : raw;
    const parsed = new URL(normalized);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.toString()
      : fallback;
  } catch {
    return fallback;
  }
}

export function inferExtension(url, contentType = "") {
  const contentTypeMap = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif",
  };

  if (contentTypeMap[contentType]) {
    return contentTypeMap[contentType];
  }

  try {
    const parsed = new URL(url);
    const fileExtension = extname(parsed.pathname);
    if (fileExtension) {
      return fileExtension.toLowerCase();
    }
  } catch {
    // Ignore URL parse errors.
  }

  return ".jpg";
}
