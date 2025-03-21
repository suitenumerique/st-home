import { expect, test } from "@playwright/test";

const url = "/";

test("has title", async ({ page }) => {
  await page.goto(url);

  await expect(page).toHaveTitle(/Suite territoriale/);
});

test("has commune search", async ({ page }) => {
  await page.goto(url);

  await expect(
    page.getByRole("searchbox", { name: /Rechercher une commune/i }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Accéder" })).toBeVisible();
});

test("has services section", async ({ page }) => {
  await page.goto(url);

  await expect(
    page.getByRole("heading", { name: "Nos services" }),
  ).toBeVisible();
  await expect(page.getByText("Démarches Simplifiées")).toBeVisible();
  await expect(page.getByText("France Connect")).toBeVisible();
  await expect(page.getByText("Data.gouv.fr")).toBeVisible();
});
