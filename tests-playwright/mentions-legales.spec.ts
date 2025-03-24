import { expect, test } from "@playwright/test";

const url = "/mentions-legales";

test("has title", async ({ page }) => {
  await page.goto(url);

  await expect(page).toHaveTitle(/Mentions légales | beta.gouv.fr/);
});

test("has proper headers", async ({ page }) => {
  await page.goto(url);

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Mentions légales",
  );

  const requiredHeaders = ["Hébergement du site"];

  await Promise.all(
    requiredHeaders.map(async (text) =>
      expect(
        await page.getByRole("heading", { level: 2 }).getByText(text).count(),
      ).toBe(1),
    ),
  );
});
