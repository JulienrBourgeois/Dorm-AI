import { expect, test } from "@playwright/test";

test.describe("invite deep-link auth branching", () => {
  test("routes signed-out existing invite email to email-login", async ({ page }) => {
    await page.route("**/api/auth/check-email", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { exists: true } }),
      });
    });

    await page.goto("/join/abcd?e=existing@example.com");
    await expect(page).toHaveURL(/\/signup\?/);
    const url = new URL(page.url());
    expect(url.searchParams.get("step")).toBe("email-login");
    expect(url.searchParams.get("email")).toBe("existing@example.com");
    expect(url.searchParams.get("next")).toContain("/join?code=ABCD");
  });

  test("routes signed-out new invite email to email-signup", async ({ page }) => {
    await page.route("**/api/auth/check-email", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { exists: false } }),
      });
    });

    await page.goto("/join/efgh?e=newuser@example.com");
    await expect(page).toHaveURL(/\/signup\?/);
    const url = new URL(page.url());
    expect(url.searchParams.get("step")).toBe("email-signup");
    expect(url.searchParams.get("email")).toBe("newuser@example.com");
    expect(url.searchParams.get("next")).toContain("/join?code=EFGH");
  });
});
