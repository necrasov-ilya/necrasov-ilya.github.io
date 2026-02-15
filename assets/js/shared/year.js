import { qs, setText } from "./dom.js";

export const setCurrentYear = (selector = "#year") => {
  const yearNode = qs(selector);
  if (yearNode) {
    setText(yearNode, new Date().getFullYear());
  }
};
