import { loadProjectsData } from "./service.js";
import {
  animateProjectsExpansion,
  renderProjects,
  renderProjectsEmpty,
  renderProjectsLoading,
  updateMoreButtonState,
} from "./renderer.js";

const PAGE_SIZE = 6;

export const initProjects = async ({
  gridId = "projects-grid",
  moreButtonId = "projects-more",
} = {}) => {
  const projectsRoot = document.getElementById(gridId);
  const projectsMoreButton = document.getElementById(moreButtonId);

  if (!projectsRoot) {
    return;
  }

  let allProjects = [];
  let visibleProjectsCount = 0;

  const syncMoreButton = () => {
    updateMoreButtonState({
      button: projectsMoreButton,
      visibleCount: visibleProjectsCount,
      totalCount: allProjects.length,
    });
  };

  const renderCurrentSlice = (previousVisibleCount = 0, animateNewCards = false) => {
    if (allProjects.length === 0) {
      renderProjectsEmpty(projectsRoot, "Проекты скоро будут добавлены.");
      if (projectsMoreButton) {
        projectsMoreButton.hidden = true;
      }
      return;
    }

    renderProjects({
      root: projectsRoot,
      projects: allProjects,
      visibleCount: visibleProjectsCount,
      previousVisibleCount,
      animateNewCards,
    });

    syncMoreButton();
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
      renderCurrentSlice(previousVisibleCount, true);

      const toHeight = projectsRoot.getBoundingClientRect().height;
      animateProjectsExpansion({
        container: projectsRoot,
        fromHeight,
        toHeight,
      });
    });
  }

  if (projectsMoreButton) {
    projectsMoreButton.hidden = true;
  }

  renderProjectsLoading(projectsRoot, "Загружаю проекты из GitHub...");

  const { projects } = await loadProjectsData();
  allProjects = projects;
  visibleProjectsCount = Math.min(PAGE_SIZE, allProjects.length);
  renderCurrentSlice(0, false);
};
