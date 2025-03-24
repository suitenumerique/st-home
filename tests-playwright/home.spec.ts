import { expect, test } from "@playwright/test";

const url = "/";

test("has title", async ({ page }) => {
  await page.goto(url);

  await expect(page).toHaveTitle(/La Suite territoriale/);
});

test("has commune search", async ({ page }) => {
  await page.goto(url);

  await expect(
    page.getByPlaceholder(
      "Renseignez le nom ou le code postal de votre commune",
    ),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Rechercher" })).toBeVisible();
});

test("has services section", async ({ page }) => {
  await page.goto(url);

  await expect(
    page.getByRole("heading", {
      name: "Des outils professionnels pour votre collectivité",
    }),
  ).toBeVisible();
  await expect(page.getByText("Un socle de services essentiels")).toBeVisible();
});
