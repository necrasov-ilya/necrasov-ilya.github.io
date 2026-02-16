import { expect, test } from "@playwright/test";

const collectRuntimeErrors = (page) => {
  const errors = [];

  page.on("pageerror", (error) => {
    errors.push(error.message);
  });

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });

  return errors;
};

test("index page: sections load without runtime errors", async ({ page }) => {
  const errors = collectRuntimeErrors(page);

  await page.goto("/index.html", { waitUntil: "domcontentloaded" });

  await expect(page.locator("#hero")).toBeVisible();
  await expect(page.locator("#about")).toBeVisible();
  await expect(page.locator("#projects")).toBeVisible();
  await expect(page.locator("#its-u")).toBeVisible();
  await expect(page.locator("#contacts")).toBeVisible();

  await expect(page.locator("#projects-grid .project-card").first()).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.locator("#device-id")).not.toHaveText("вычисление...", { timeout: 15_000 });

  expect(errors, errors.join("\n")).toEqual([]);
});

test("blog page: cards render, show more and refresh work", async ({ page }) => {
  const errors = collectRuntimeErrors(page);

  await page.goto("/blog.html", { waitUntil: "domcontentloaded" });

  await expect(page.locator("#blog-feed")).toBeVisible();
  await expect(page.locator("#blog-feed .blog-card").first()).toBeVisible({ timeout: 15_000 });

  const firstCard = page.locator("#blog-feed .blog-card").first();
  const readHereButton = firstCard.locator(".blog-inline-toggle");
  await expect(readHereButton).toBeVisible();
  await expect(firstCard).not.toHaveClass(/is-expanded/);
  await readHereButton.click();
  await expect(firstCard).toHaveClass(/is-expanded/);
  await readHereButton.click();
  await expect(firstCard).not.toHaveClass(/is-expanded/);

  const cardsBefore = await page.locator("#blog-feed .blog-card").count();
  const countText = (await page.locator("#blog-count").textContent()) || "0";
  const totalPosts = Number.parseInt(countText, 10) || 0;

  const moreButton = page.locator("#blog-more");

  if (totalPosts > cardsBefore) {
    await expect(moreButton).toBeVisible();
    await moreButton.click();
    await expect
      .poll(async () => page.locator("#blog-feed .blog-card").count(), {
        timeout: 10_000,
      })
      .toBeGreaterThan(cardsBefore);
  }

  const refreshButton = page.locator("#blog-refresh");
  await refreshButton.click();
  await expect(refreshButton).toHaveAttribute("aria-busy", "true");
  await expect(refreshButton).toHaveAttribute("aria-busy", "false", { timeout: 10_000 });
  await expect(page.locator("#blog-feed .blog-card").first()).toBeVisible();

  expect(errors, errors.join("\n")).toEqual([]);
});
