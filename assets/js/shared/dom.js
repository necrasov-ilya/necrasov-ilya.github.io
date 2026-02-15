export const qs = (selector, root = document) => root.querySelector(selector);

export const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

export const isElement = (value) => value instanceof Element;

export const setText = (node, value) => {
  if (node) {
    node.textContent = String(value ?? "");
  }
};

export const setHtml = (node, value) => {
  if (node) {
    node.innerHTML = String(value ?? "");
  }
};

export const on = (target, eventName, handler, options) => {
  if (!target) {
    return () => {};
  }

  target.addEventListener(eventName, handler, options);
  return () => {
    target.removeEventListener(eventName, handler, options);
  };
};
