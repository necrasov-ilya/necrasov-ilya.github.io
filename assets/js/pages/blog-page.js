import { initBlogFeed } from "../features/blog/controller.js";
import { initHeaderMenu } from "../features/header/index.js";
import { setCurrentYear } from "../shared/year.js";

const initBlogPage = async () => {
  setCurrentYear();
  initHeaderMenu();
  await initBlogFeed();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    void initBlogPage();
  });
} else {
  void initBlogPage();
}
