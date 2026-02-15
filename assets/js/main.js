(() => {
  const year = document.getElementById("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const header = document.querySelector(".site-header");
  const heroSection = document.getElementById("hero");

  const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
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
    if (!header || !heroSection) {
      return;
    }

    const heroBottom = heroSection.getBoundingClientRect().bottom;
    header.classList.toggle("is-visible", heroBottom <= 0);
  };

  const updateActiveNav = () => {
    if (!sectionMap.length) {
      return;
    }

    const headerOffset = header ? header.offsetHeight : 0;
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

    const scrolledToBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (scrolledToBottom) {
      active = sectionMap[sectionMap.length - 1];
    }

    navLinks.forEach((link) => link.classList.remove("is-active"));
    active.link.classList.add("is-active");
  };

  let scrollTicking = false;
  const onScrollOrResize = () => {
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

  updateHeaderVisibility();
  updateActiveNav();
  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize);

  const revealSelector = ".section-head, .panel, .panel-dark, .project-card, .status-card";
  let revealObserver = null;

  if ("IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -8% 0px",
      },
    );
  }

  const attachReveal = (node) => {
    if (!(node instanceof Element) || node.classList.contains("reveal")) {
      return;
    }

    node.classList.add("reveal");
    if (revealObserver) {
      revealObserver.observe(node);
      return;
    }

    node.classList.add("is-visible");
  };

  const bindRevealTargets = (root) => {
    if (!(root instanceof Element) && root !== document) {
      return;
    }

    const host = root === document ? document : root;
    host.querySelectorAll(revealSelector).forEach(attachReveal);

    if (root instanceof Element && root.matches(revealSelector)) {
      attachReveal(root);
    }
  };

  bindRevealTargets(document);

  if ("MutationObserver" in window) {
    const dynamicRevealObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            bindRevealTargets(node);
          }
        });
      });
      onScrollOrResize();
    });

    dynamicRevealObserver.observe(document.body, { childList: true, subtree: true });
  }
})();
