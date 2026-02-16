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

const createProjectsMarkup = (projects, { entering = false } = {}) =>
  projects.map((project) => createProjectCard(project, entering)).join("");

export const renderProjectsLoading = (root, message) => {
  root.innerHTML = `<p class="projects-empty">${escapeHtml(message)}</p>`;
};

export const renderProjectsEmpty = (root, message) => {
  root.innerHTML = `<p class="projects-empty">${escapeHtml(message)}</p>`;
};

export const renderProjectsReplace = ({ root, projects }) => {
  root.innerHTML = createProjectsMarkup(projects, { entering: false });
};

export const renderProjectsAppend = ({ root, projects }) => {
  if (!Array.isArray(projects) || projects.length === 0) {
    return;
  }

  root.insertAdjacentHTML("beforeend", createProjectsMarkup(projects, { entering: true }));
};
