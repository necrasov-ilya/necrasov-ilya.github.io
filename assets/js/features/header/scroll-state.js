import { qs, qsa } from "../../shared/dom.js";

export const initHeaderScrollState = () => {
  const header = qs(".site-header");
  const heroSection = qs("#hero");

  if (!header) {
    return { requestUpdate: () => {} };
  }

  const navLinks = qsa(".site-nav a");
  const sectionMap = navLinks
    .map((link) => {
      const id = link.getAttribute("href")?.replace("#", "");
      if (!id) {
        return null;
      }

      const section = document.getElementById(id);
      if (!section) {
        return null;
      }

      return { link, section };
    })
    .filter(Boolean);

  const updateHeaderVisibility = () => {
    if (!heroSection) {
      header.classList.add("is-visible");
      return;
    }

    const heroBottom = heroSection.getBoundingClientRect().bottom;
    header.classList.toggle("is-visible", heroBottom <= 0);
  };

  const updateActiveNav = () => {
    if (sectionMap.length === 0) {
      return;
    }

    const headerOffset = header.offsetHeight;
    const viewportTop = headerOffset + 8;
    const viewportBottom = window.innerHeight;

    let active = sectionMap[0];
    let maxVisibleHeight = -Infinity;

    sectionMap.forEach((item) => {
      const rect = item.section.getBoundingClientRect();
      const visibleHeight = Math.min(rect.bottom, viewportBottom) - Math.max(rect.top, viewportTop);

      if (visibleHeight > maxVisibleHeight) {
        maxVisibleHeight = visibleHeight;
        active = item;
      }
    });

    const reachedBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (reachedBottom) {
      active = sectionMap[sectionMap.length - 1];
    }

    navLinks.forEach((link) => link.classList.remove("is-active"));
    active.link.classList.add("is-active");
  };

  let scrollTicking = false;

  const requestUpdate = () => {
    if (scrollTicking) {
      return;
    }

    scrollTicking = true;
    window.requestAnimationFrame(() => {
      updateHeaderVisibility();
      updateActiveNav();
      scrollTicking = false;
    });
  };

  requestUpdate();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);

  return { requestUpdate };
};
