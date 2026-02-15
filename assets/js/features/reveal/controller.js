import { isElement, qsa } from "../../shared/dom.js";

const DEFAULT_SELECTOR = ".section-head, .panel, .panel-dark, .project-card, .status-card";

export const initRevealEffects = ({ selector = DEFAULT_SELECTOR, onMutated = () => {} } = {}) => {
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
    if (!isElement(node) || node.classList.contains("reveal")) {
      return;
    }

    node.classList.add("reveal");

    if (revealObserver) {
      revealObserver.observe(node);
      return;
    }

    node.classList.add("is-visible");
  };

  const bindRevealTargets = (root = document) => {
    const host = root === document ? document : root;

    qsa(selector, host).forEach(attachReveal);

    if (isElement(root) && root.matches(selector)) {
      attachReveal(root);
    }
  };

  bindRevealTargets(document);

  if ("MutationObserver" in window) {
    const dynamicRevealObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (isElement(node)) {
            bindRevealTargets(node);
          }
        });
      });

      onMutated();
    });

    dynamicRevealObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
};
