import { initHeaderMenu, initHeaderScrollState } from "../features/header/index.js";
import { initProjects } from "../features/projects/controller.js";
import { initRevealEffects } from "../features/reveal/controller.js";
import { initItsUPassport } from "../features/its-u/controller.js";
import { setCurrentYear } from "../shared/year.js";

const initIndexPage = async () => {
  setCurrentYear();
  initHeaderMenu();

  const { requestUpdate } = initHeaderScrollState();
  initRevealEffects({ onMutated: requestUpdate });

  await Promise.allSettled([initProjects(), initItsUPassport()]);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    void initIndexPage();
  });
} else {
  void initIndexPage();
}
