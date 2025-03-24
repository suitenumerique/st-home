import { expect, test } from "@playwright/test";

const url = "/politique-de-confidentialite";

test("has title", async ({ page }) => {
  await page.goto(url);

  await expect(page).toHaveTitle(
    /Politique de confidentialité - La Suite territoriale/,
  );
});

test("has proper headers", async ({ page }) => {
  await page.goto(url);

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Politique de confidentialité",
  );
});
