import { qs } from "../../shared/dom.js";

const MOBILE_QUERY = "(max-width: 900px)";

export const initHeaderMenu = () => {
  const toggleButton = qs(".menu-toggle");
  const headerTools = qs(".header-tools");

  if (!toggleButton || !headerTools) {
    return;
  }

  const icon = qs(".material-symbols-outlined", toggleButton);
  const mobileQuery = window.matchMedia(MOBILE_QUERY);
  const existingBackdrop = qs(".menu-backdrop");
  const backdrop = existingBackdrop || document.createElement("div");

  if (!existingBackdrop) {
    backdrop.className = "menu-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    document.body.append(backdrop);
  }

  const isMobile = () => mobileQuery.matches;

  const setExpanded = (expanded) => {
    toggleButton.setAttribute("aria-expanded", expanded ? "true" : "false");
    toggleButton.setAttribute("aria-label", expanded ? "Close menu" : "Open menu");
    headerTools.classList.toggle("is-open", expanded);
    backdrop.classList.toggle("is-open", expanded);
    document.body.classList.toggle("menu-open", expanded && isMobile());

    if (icon) {
      icon.textContent = expanded ? "close" : "menu";
    }
  };

  const closeMenu = () => setExpanded(false);

  toggleButton.addEventListener("click", () => {
    if (!isMobile()) {
      return;
    }

    const expanded = toggleButton.getAttribute("aria-expanded") === "true";
    setExpanded(!expanded);
  });

  headerTools.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link || !isMobile()) {
      return;
    }
    closeMenu();
  });

  backdrop.addEventListener("click", closeMenu);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  const onResize = () => {
    if (!isMobile()) {
      closeMenu();
      return;
    }

    document.body.classList.toggle(
      "menu-open",
      toggleButton.getAttribute("aria-expanded") === "true",
    );
  };

  window.addEventListener("resize", onResize);
  closeMenu();
};
