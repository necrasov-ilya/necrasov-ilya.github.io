import { extractGitHubProjects, normalizeProjectsPayload } from "./mapper.js";

const GITHUB_USERNAME = "necrasov-ilya";
const CACHE_KEY = "necrasov_projects_cache_v1";
const CACHE_TTL_MS = 1000 * 60 * 15;

const fallbackProjects = [
  {
    title: "Vision QA Console",
    year: "2026",
    summary:
      "Платформа визуального контроля качества с моделью детекции аномалий и web-дашбордом для операторов.",
    tags: ["TypeScript", "Python", "FastAPI", "Computer Vision"],
    links: [
      { label: "Кейс", url: "#" },
      { label: "Код", url: "#" },
    ],
  },
];

const getGitHubReposUrl = (username) =>
  `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed&direction=desc`;

const readCache = () => {
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.projects) || typeof parsed.savedAt !== "number") {
      return null;
    }

    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) {
      return null;
    }

    return parsed.projects;
  } catch {
    return null;
  }
};

const writeCache = (projects) => {
  try {
    window.sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        savedAt: Date.now(),
        projects,
      }),
    );
  } catch {
    // Ignore storage write errors.
  }
};

const fetchProjectsFromGitHub = async (username) => {
  const response = await fetch(getGitHubReposUrl(username), {
    headers: {
      Accept: "application/vnd.github+json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const payload = await response.json();
  return extractGitHubProjects(payload);
};

const fetchProjectsFromLocalFile = async (path) => {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Не удалось загрузить локальные проекты");
  }

  const payload = await response.json();
  return normalizeProjectsPayload(payload);
};

export const loadProjectsData = async ({
  githubUsername = GITHUB_USERNAME,
  localProjectsPath = "assets/data/projects.json",
} = {}) => {
  const cachedProjects = readCache();
  if (cachedProjects && cachedProjects.length > 0) {
    return { projects: cachedProjects, source: "cache" };
  }

  try {
    const githubProjects = await fetchProjectsFromGitHub(githubUsername);
    if (githubProjects.length > 0) {
      writeCache(githubProjects);
      return { projects: githubProjects, source: "github" };
    }
  } catch {
    // Fall back to local file.
  }

  try {
    const localProjects = await fetchProjectsFromLocalFile(localProjectsPath);
    if (localProjects.length > 0) {
      return { projects: localProjects, source: "local" };
    }
  } catch {
    // Fall back to hardcoded data.
  }

  return { projects: fallbackProjects, source: "fallback" };
};
