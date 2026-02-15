(() => {
  const projectsRoot = document.getElementById("projects-grid");
  const projectsMoreButton = document.getElementById("projects-more");
  if (!projectsRoot) {
    return;
  }

  const GITHUB_USERNAME = "necrasov-ilya";
  const GITHUB_REPOS_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=pushed&direction=desc`;
  const CACHE_KEY = "necrasov_projects_cache_v1";
  const CACHE_TTL = 1000 * 60 * 15;
  const PAGE_SIZE = 6;

  let allProjects = [];
  let visibleProjectsCount = 0;

  const fallbackProjects = [
    {
      title: "Vision QA Console",
      year: "2026",
      summary: "Платформа визуального контроля качества с моделью детекции аномалий и web-дашбордом для операторов.",
      tags: ["TypeScript", "Python", "FastAPI", "Computer Vision"],
      links: [
        { label: "Кейс", url: "#" },
        { label: "Код", url: "#" },
      ],
    },
  ];

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const sanitizeUrl = (url) => {
    try {
      const parsed = new URL(String(url));
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.toString();
      }
      return "#";
    } catch (error) {
      return "#";
    }
  };

  const normalizeText = (value, fallback, maxLength = 170) => {
    const raw = String(value ?? "").trim();
    if (!raw) {
      return fallback;
    }
    const compact = raw.replace(/\s+/g, " ");
    if (compact.length <= maxLength) {
      return compact;
    }
    return `${compact.slice(0, maxLength - 1).trimEnd()}…`;
  };

  const normalizeProjects = (payload) => {
    if (Array.isArray(payload)) {
      return payload;
    }
    if (payload && Array.isArray(payload.projects)) {
      return payload.projects;
    }
    return [];
  };

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
      if (Date.now() - parsed.savedAt > CACHE_TTL) {
        return null;
      }
      return parsed.projects;
    } catch (error) {
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
    } catch (error) {
      // Ignore storage errors.
    }
  };

  const toProjectFromRepo = (repo) => {
    const year = repo?.pushed_at ? String(new Date(repo.pushed_at).getFullYear()) : "Н/Д";
    const tags = [];

    if (repo?.language) {
      tags.push(repo.language);
    }
    if (Array.isArray(repo?.topics) && repo.topics.length) {
      tags.push(...repo.topics.slice(0, 3));
    }
    if (typeof repo?.stargazers_count === "number") {
      tags.push(`★ ${repo.stargazers_count}`);
    }
    if (!tags.length) {
      tags.push("GitHub");
    }

    const links = [{ label: "Код", url: sanitizeUrl(repo?.html_url) }];
    if (repo?.homepage) {
      links.unshift({ label: "Демо", url: sanitizeUrl(repo.homepage) });
    }

    return {
      title: normalizeText(repo?.name, "Без названия", 80),
      year,
      summary: normalizeText(repo?.description, "Описание репозитория пока не добавлено.", 170),
      tags: tags.slice(0, 5),
      links,
    };
  };

  const extractGitHubProjects = (payload) => {
    if (!Array.isArray(payload)) {
      return [];
    }

    return payload
      .filter((repo) => repo && !repo.fork && !repo.archived)
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
      .map(toProjectFromRepo);
  };

  const createLink = (link) => {
    const safeLabel = escapeHtml(link.label || "Ссылка");
    const safeUrl = sanitizeUrl(link.url || "#");
    const isExternal = /^https?:\/\//.test(safeUrl);
    const targetAttrs = isExternal ? ' target="_blank" rel="noreferrer noopener"' : "";
    return `<a class="project-link" href="${safeUrl}"${targetAttrs}>${safeLabel}</a>`;
  };

  const createCard = (project, isEntering = false) => {
    const tags = Array.isArray(project.tags)
      ? project.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")
      : "";

    const links = Array.isArray(project.links)
      ? project.links.map(createLink).join("")
      : "";

    return `
      <article class="project-card panel-dark${isEntering ? " is-entering" : ""}">
        <header class="project-top">
          <h3>${escapeHtml(project.title || "Проект без названия")}</h3>
          <span class="project-year">${escapeHtml(project.year || "Н/Д")}</span>
        </header>
        <p>${escapeHtml(project.summary || "Описание проекта добавляется.")}</p>
        <ul class="project-tags">${tags}</ul>
        <footer class="project-links">${links}</footer>
      </article>
    `;
  };

  const updateMoreButton = () => {
    if (!projectsMoreButton) {
      return;
    }

    const hasMore = visibleProjectsCount < allProjects.length;
    projectsMoreButton.hidden = !hasMore;
  };

  const animateProjectsExpansion = (fromHeight, toHeight) => {
    if (toHeight <= fromHeight) {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    projectsRoot.style.height = `${fromHeight}px`;
    projectsRoot.style.overflow = "hidden";
    projectsRoot.style.transition = "height 420ms cubic-bezier(0.22, 1, 0.36, 1)";

    window.requestAnimationFrame(() => {
      projectsRoot.style.height = `${toHeight}px`;
    });

    const cleanup = () => {
      projectsRoot.style.height = "";
      projectsRoot.style.overflow = "";
      projectsRoot.style.transition = "";
    };

    window.setTimeout(cleanup, 460);
  };

  const renderProjects = (previousVisibleCount = 0, animateNewCards = false) => {
    if (!allProjects.length) {
      projectsRoot.innerHTML = '<p class="projects-empty">Проекты скоро будут добавлены.</p>';
      if (projectsMoreButton) {
        projectsMoreButton.hidden = true;
      }
      return;
    }

    const visibleProjects = allProjects.slice(0, visibleProjectsCount);
    projectsRoot.innerHTML = visibleProjects
      .map((project, index) => createCard(project, animateNewCards && index >= previousVisibleCount))
      .join("");
    updateMoreButton();
  };

  const setProjects = (projects) => {
    allProjects = projects;
    visibleProjectsCount = Math.min(PAGE_SIZE, allProjects.length);
    renderProjects(0, false);
  };

  const fetchProjectsFromGitHub = async () => {
    const response = await fetch(GITHUB_REPOS_URL, {
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

  const loadProjects = async () => {
    if (projectsMoreButton) {
      projectsMoreButton.hidden = true;
    }

    const cached = readCache();
    if (cached && cached.length) {
      setProjects(cached);
      return;
    }

    projectsRoot.innerHTML = '<p class="projects-empty">Загружаю проекты из GitHub...</p>';

    try {
      const githubProjects = await fetchProjectsFromGitHub();
      if (githubProjects.length) {
        writeCache(githubProjects);
        setProjects(githubProjects);
        return;
      }
    } catch (error) {
      // Fall back to local file.
    }

    try {
      const response = await fetch("assets/data/projects.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Не удалось загрузить локальные проекты");
      }
      const data = await response.json();
      const localProjects = normalizeProjects(data);
      setProjects(localProjects.length ? localProjects : fallbackProjects);
    } catch (error) {
      setProjects(fallbackProjects);
    }
  };

  if (projectsMoreButton) {
    projectsMoreButton.addEventListener("click", () => {
      if (visibleProjectsCount >= allProjects.length) {
        projectsMoreButton.hidden = true;
        return;
      }

      const previousVisibleCount = visibleProjectsCount;
      const fromHeight = projectsRoot.getBoundingClientRect().height;
      visibleProjectsCount = Math.min(visibleProjectsCount + PAGE_SIZE, allProjects.length);
      renderProjects(previousVisibleCount, true);
      const toHeight = projectsRoot.getBoundingClientRect().height;
      animateProjectsExpansion(fromHeight, toHeight);
    });
  }

  loadProjects();
})();
