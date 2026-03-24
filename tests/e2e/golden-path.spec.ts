import { expect, test } from "@playwright/test";

test("landing to auth chooser baseline golden path", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Property inspections,")).toBeVisible();
  await expect(page.getByRole("link", { name: "Get started free" })).toBeVisible();

  await page.getByRole("link", { name: "Get started free" }).click();
  await expect(page).toHaveURL(/\/signup$/);
  await expect(page.getByText("Sign up with email")).toBeVisible();

  await page.goto("/signup?step=login-chooser");
  await expect(page).toHaveURL(/step=login-chooser/);
  await expect(page.getByText("Continue with email")).toBeVisible();
});
