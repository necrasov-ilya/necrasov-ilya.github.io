import {
  DEFAULT_INCREMENTAL_PAGE_SIZE,
  createIncrementalFeed,
} from "../../shared/incremental-feed.js";
import { loadProjectsData } from "./service.js";
import {
  renderProjectsAppend,
  renderProjectsEmpty,
  renderProjectsLoading,
  renderProjectsReplace,
} from "./renderer.js";

export const initProjects = async ({
  gridId = "projects-grid",
  moreButtonId = "projects-more",
  pageSize = DEFAULT_INCREMENTAL_PAGE_SIZE,
} = {}) => {
  const projectsRoot = document.getElementById(gridId);
  const projectsMoreButton = document.getElementById(moreButtonId);

  if (!projectsRoot) {
    return;
  }

  const feed = createIncrementalFeed({
    root: projectsRoot,
    moreButton: projectsMoreButton,
    pageSize,
    renderLoading: ({ root }) => {
      renderProjectsLoading(root, "Загружаю проекты из GitHub...");
    },
    renderEmpty: ({ root }) => {
      renderProjectsEmpty(root, "Проекты скоро будут добавлены.");
    },
    renderReplace: ({ root, items }) => {
      renderProjectsReplace({ root, projects: items });
    },
    renderAppend: ({ root, items }) => {
      renderProjectsAppend({ root, projects: items });
    },
  });

  if (!feed) {
    return;
  }

  feed.showLoading();

  try {
    const { projects } = await loadProjectsData();
    feed.setItems(projects);
  } catch {
    feed.setItems([]);
  }
};
