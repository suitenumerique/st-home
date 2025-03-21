import { expect, test } from "@playwright/test";

const url = "/politique-confidentialite";

test("has title", async ({ page }) => {
  await page.goto(url);

  await expect(page).toHaveTitle(/Politique de confidentialité | beta.gouv.fr/);
});

test("has proper headers", async ({ page }) => {
  await page.goto(url);

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Politique de confidentialité",
  );

  const requiredHeaders = [
    "Traitement des données à caractère personnel",
    "Cookies",
  ];

  await Promise.all(
    requiredHeaders.map(async (text) =>
      expect(
        await page.getByRole("heading", { level: 2 }).getByText(text).count(),
      ).toBe(1),
    ),
  );
});
