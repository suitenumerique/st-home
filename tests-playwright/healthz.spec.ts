import { expect, test } from "@playwright/test";

const url = "/healthz";

test("is a health page", async ({ page }) => {
  await page.goto(url);

  // Expect a title "to contain" a substring.
  await expect(page.getByRole("heading", { level: 1 })).toContainText("App is up and running");
});
