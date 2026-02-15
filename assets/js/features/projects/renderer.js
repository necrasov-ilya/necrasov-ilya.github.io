import { escapeHtml, sanitizeUrl } from "../../shared/format.js";

const createProjectLink = (link) => {
  const safeLabel = escapeHtml(link?.label || "Ссылка");
  const safeUrl = sanitizeUrl(link?.url || "#", { fallback: "#" });
  const isExternal = /^https?:\/\//.test(safeUrl);
  const targetAttrs = isExternal ? ' target="_blank" rel="noreferrer noopener"' : "";

  return `<a class="project-link" href="${safeUrl}"${targetAttrs}>${safeLabel}</a>`;
};

const createProjectCard = (project, isEntering = false) => {
  const tags = Array.isArray(project?.tags)
    ? project.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")
    : "";

  const links = Array.isArray(project?.links) ? project.links.map(createProjectLink).join("") : "";

  return `
    <article class="project-card panel-dark${isEntering ? " is-entering" : ""}">
      <header class="project-top">
        <h3>${escapeHtml(project?.title || "Проект без названия")}</h3>
        <span class="project-year">${escapeHtml(project?.year || "Н/Д")}</span>
      </header>
      <p>${escapeHtml(project?.summary || "Описание проекта добавляется.")}</p>
      <ul class="project-tags">${tags}</ul>
      <footer class="project-links">${links}</footer>
    </article>
  `;
};

export const renderProjectsLoading = (root, message) => {
  root.innerHTML = `<p class="projects-empty">${escapeHtml(message)}</p>`;
};

export const renderProjectsEmpty = (root, message) => {
  root.innerHTML = `<p class="projects-empty">${escapeHtml(message)}</p>`;
};

export const renderProjects = ({
  root,
  projects,
  visibleCount,
  previousVisibleCount = 0,
  animateNewCards = false,
}) => {
  const visibleProjects = projects.slice(0, visibleCount);

  root.innerHTML = visibleProjects
    .map((project, index) =>
      createProjectCard(project, animateNewCards && index >= previousVisibleCount),
    )
    .join("");
};

export const updateMoreButtonState = ({ button, visibleCount, totalCount }) => {
  if (!button) {
    return;
  }

  button.hidden = visibleCount >= totalCount;
};

export const animateProjectsExpansion = ({ container, fromHeight, toHeight }) => {
  if (toHeight <= fromHeight) {
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  container.style.height = `${fromHeight}px`;
  container.style.overflow = "hidden";
  container.style.transition = "height 420ms cubic-bezier(0.22, 1, 0.36, 1)";

  window.requestAnimationFrame(() => {
    container.style.height = `${toHeight}px`;
  });

  window.setTimeout(() => {
    container.style.height = "";
    container.style.overflow = "";
    container.style.transition = "";
  }, 460);
};
