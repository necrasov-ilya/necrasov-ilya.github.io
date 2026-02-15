(() => {
  const year = document.getElementById("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const revealTargets = Array.from(document.querySelectorAll(".section-head, .panel, .panel-dark, .project-card, .status-card"));
  revealTargets.forEach((node) => node.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
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

    revealTargets.forEach((node) => revealObserver.observe(node));
  } else {
    revealTargets.forEach((node) => node.classList.add("is-visible"));
  }

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

  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const matched = sectionMap.find((item) => item.section === entry.target);
          if (!matched || !entry.isIntersecting) {
            return;
          }

          navLinks.forEach((link) => link.classList.remove("is-active"));
          matched.link.classList.add("is-active");
        });
      },
      {
        threshold: 0.32,
        rootMargin: "-10% 0px -55% 0px",
      },
    );

    sectionMap.forEach((item) => navObserver.observe(item.section));
  }

  const header = document.querySelector(".site-header");
  const updateHeaderTone = () => {
    if (!header) {
      return;
    }

    const switchPoint = Math.max(window.innerHeight * 0.48, 260);
    header.classList.toggle("is-dark", window.scrollY > switchPoint);
  };

  updateHeaderTone();
  window.addEventListener("scroll", updateHeaderTone, { passive: true });
})();
