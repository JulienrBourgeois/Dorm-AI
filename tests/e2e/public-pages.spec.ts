import { expect, test } from "@playwright/test";

test.describe("public legal pages", () => {
  test("terms page shows sample heading", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.getByRole("heading", { name: /Terms of Use \(sample\)/ })).toBeVisible();
  });

  test("privacy page shows sample heading", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: /Privacy Policy \(sample\)/ })).toBeVisible();
  });
});
