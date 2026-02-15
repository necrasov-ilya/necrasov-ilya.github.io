(() => {
  const toggleButton = document.querySelector(".menu-toggle");
  const headerTools = document.querySelector(".header-tools");

  if (!toggleButton || !headerTools) {
    return;
  }

  const icon = toggleButton.querySelector(".material-symbols-outlined");
  const mobileQuery = window.matchMedia("(max-width: 900px)");
  const backdrop = document.createElement("div");
  backdrop.className = "menu-backdrop";
  backdrop.setAttribute("aria-hidden", "true");
  document.body.appendChild(backdrop);

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
    document.body.classList.toggle("menu-open", toggleButton.getAttribute("aria-expanded") === "true");
  };

  window.addEventListener("resize", onResize);

  closeMenu();
})();
