(() => {
  const projectsRoot = document.getElementById("projects-grid");
  if (!projectsRoot) {
    return;
  }

  const fallbackProjects = [
    {
      title: "Vision QA Console",
      year: "2026",
      summary: "Платформа визуального контроля качества с моделью детекции аномалий и web-дашбордом для операторов.",
      tags: ["TypeScript", "Python", "FastAPI", "Computer Vision"],
      links: [
        { label: "Case", url: "#" },
        { label: "Code", url: "#" },
      ],
    },
  ];

  const normalizeProjects = (payload) => {
    if (Array.isArray(payload)) {
      return payload;
    }

    if (payload && Array.isArray(payload.projects)) {
      return payload.projects;
    }

    return [];
  };

  const createLink = (link) => {
    const safeLabel = link.label || "Link";
    const safeUrl = link.url || "#";
    const isExternal = /^https?:\/\//.test(safeUrl);
    const targetAttrs = isExternal ? ' target="_blank" rel="noreferrer noopener"' : "";
    return `<a class="project-link" href="${safeUrl}"${targetAttrs}>${safeLabel}</a>`;
  };

  const createCard = (project) => {
    const tags = Array.isArray(project.tags)
      ? project.tags.map((tag) => `<li>${tag}</li>`).join("")
      : "";

    const links = Array.isArray(project.links)
      ? project.links.map(createLink).join("")
      : "";

    return `
      <article class="project-card panel-dark">
        <header class="project-top">
          <h3>${project.title || "Untitled Project"}</h3>
          <span class="project-year">${project.year || "N/A"}</span>
        </header>
        <p>${project.summary || "Описание проекта добавляется."}</p>
        <ul class="project-tags">${tags}</ul>
        <footer class="project-links">${links}</footer>
      </article>
    `;
  };

  const renderProjects = (projects) => {
    if (!projects.length) {
      projectsRoot.innerHTML = '<p class="projects-empty">Проекты скоро будут добавлены.</p>';
      return;
    }

    const content = projects.map(createCard).join("");
    projectsRoot.innerHTML = content;
  };

  const loadProjects = async () => {
    try {
      const response = await fetch("assets/data/projects.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to load projects data");
      }

      const data = await response.json();
      renderProjects(normalizeProjects(data));
    } catch (error) {
      renderProjects(fallbackProjects);
    }
  };

  loadProjects();
})();
