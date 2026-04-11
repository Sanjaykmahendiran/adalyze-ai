import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Auth Smoke Tests — no credentials used, just render + redirect verification
// ---------------------------------------------------------------------------

test.describe("Auth Smoke Tests", () => {
  test("/login — page renders with email + password inputs", async ({ page }) => {
    await page.goto("/login");
    // Login page streams a video from adalyze.app — networkidle never settles.
    await page.waitForLoadState("domcontentloaded");

    // Page heading
    await expect(page.locator("h1")).toContainText("Login to Your Account");

    // Email input field (react-hook-form register("email"))
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInput.first()).toBeVisible();

    // Password input field
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    await expect(passwordInput.first()).toBeVisible();

    // Submit / login button should exist
    const loginButton = page.locator(
      'button[type="submit"], button:has-text("Login"), button:has-text("Sign In")',
    );
    await expect(loginButton.first()).toBeVisible();
  });

  test("/dashboard (not logged in) — redirects away within 5s", async ({ page }) => {
    // Clear any cookies to ensure unauthenticated state
    await page.context().clearCookies();

    await page.goto("/dashboard");

    // The useFetchUserDetails hook calls logout() when no userId cookie is found
    // and the pathname is not in the public allow-list.
    // logout() redirects to "/" via router.push("/").
    // Wait up to 5 seconds for navigation away from /dashboard.
    await page.waitForURL((url) => !url.pathname.includes("/dashboard"), {
      timeout: 5_000,
    });

    const finalUrl = page.url();
    expect(
      finalUrl,
      "Unauthenticated /dashboard should redirect away from dashboard",
    ).not.toContain("/dashboard");
  });
});
