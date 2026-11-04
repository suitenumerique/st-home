import { expect, test } from "@playwright/test";

// Only meaningful against a production build (`npm run test:playwright`): the dev server
// allows inline scripts, so a CSP violation never shows up there.
test("the page runs under the CSP and the header menus open", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/");

  const menu = page.getByRole("button", { name: "Services numériques" });
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("link", { name: "ProConnect" }).first()).toBeVisible();

  expect(errors.filter((text) => text.includes("Content Security Policy"))).toEqual([]);
});
