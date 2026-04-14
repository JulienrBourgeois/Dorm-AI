import { expect, test } from "@playwright/test";

test.describe("admin route protection", () => {
  test("unauthenticated user is redirected to admin login with next param", async ({
    page,
  }) => {
    await page.goto("/admin/buildings");
    await expect(page).toHaveURL(/\/admin\/login/);
    const url = new URL(page.url());
    expect(url.searchParams.get("next")).toContain("/admin/buildings");
  });
});
