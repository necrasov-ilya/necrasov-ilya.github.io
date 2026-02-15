const DEFAULT_BASE_URL = "https://example.com";

export const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const normalizeText = (value, fallback, maxLength) => {
  const raw = String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
  if (!raw) {
    return fallback;
  }
  if (typeof maxLength !== "number" || maxLength <= 0 || raw.length <= maxLength) {
    return raw;
  }
  return `${raw.slice(0, maxLength - 1).trimEnd()}...`;
};

export const getBaseUrl = () => {
  if (typeof window !== "undefined" && window.location?.href) {
    return window.location.href;
  }
  return DEFAULT_BASE_URL;
};

export const sanitizeUrl = (value, options = {}) => {
  const { base = getBaseUrl(), fallback = "#" } = options;

  try {
    const raw = String(value ?? "").trim();
    if (!raw) {
      return fallback;
    }

    const normalized = raw.startsWith("//") ? `https:${raw}` : raw;
    const parsed = new URL(normalized, base);

    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }

    return fallback;
  } catch {
    return fallback;
  }
};

export const stripHtml = (value) => {
  const html = String(value ?? "");

  if (typeof DOMParser === "undefined") {
    return html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
};

export const toDate = (value) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatDateRu = (date) => {
  if (!(date instanceof Date)) {
    return "дата неизвестна";
  }

  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDateTimeRu = (date) => {
  if (!(date instanceof Date)) {
    return "-";
  }

  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const estimateReadMinutes = (text, wordsPerMinute = 190) => {
  const words = String(text ?? "")
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / wordsPerMinute));
  return `${minutes} мин`;
};

export const listValues = (value, max = 8) => {
  if (!Array.isArray(value) || value.length === 0) {
    return "Н/Д";
  }

  const content = value.slice(0, max).join(", ");
  const suffix = value.length > max ? ` (+${value.length - max})` : "";
  return `${content}${suffix}`;
};

export const formatBytes = (bytes) => {
  if (typeof bytes !== "number" || Number.isNaN(bytes)) {
    return "Н/Д";
  }

  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const amount = bytes / 1024 ** power;

  return `${amount.toFixed(power === 0 ? 0 : 2)} ${units[power]}`;
};
