import { normalizeText, sanitizeUrl } from "../../shared/format.js";

const DEFAULT_SUMMARY = "Описание репозитория пока не добавлено.";

export const normalizeProjectsPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.projects)) {
    return payload.projects;
  }

  return [];
};

export const toProjectFromRepo = (repo) => {
  const year = repo?.pushed_at ? String(new Date(repo.pushed_at).getFullYear()) : "Н/Д";
  const tags = [];

  if (repo?.language) {
    tags.push(repo.language);
  }

  if (Array.isArray(repo?.topics) && repo.topics.length > 0) {
    tags.push(...repo.topics.slice(0, 3));
  }

  if (typeof repo?.stargazers_count === "number") {
    tags.push(`★ ${repo.stargazers_count}`);
  }

  if (tags.length === 0) {
    tags.push("GitHub");
  }

  const links = [{ label: "Код", url: sanitizeUrl(repo?.html_url, { fallback: "#" }) }];

  if (repo?.homepage) {
    links.unshift({
      label: "Демо",
      url: sanitizeUrl(repo.homepage, { fallback: "#" }),
    });
  }

  return {
    title: normalizeText(repo?.name, "Без названия", 80),
    year,
    summary: normalizeText(repo?.description, DEFAULT_SUMMARY, 170),
    tags: tags.slice(0, 5),
    links,
  };
};

export const extractGitHubProjects = (payload) => {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .filter((repo) => repo && !repo.fork && !repo.archived)
    .sort((left, right) => new Date(right.pushed_at) - new Date(left.pushed_at))
    .map(toProjectFromRepo);
};
