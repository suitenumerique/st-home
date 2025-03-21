import { expect, test } from "@playwright/test";

const url = "/stats";

test("has title", async ({ page }) => {
  await page.goto(url);

  await expect(page).toHaveTitle(/Statistiques d'utilisation | template/);
});

test("has proper headers", async ({ page }) => {
  await page.goto(url);

  await expect(
    await page
      .getByRole("heading", { level: 1 })
      .getByText("Statistiques d'impact")
      .count(),
  ).toBe(1);
});
