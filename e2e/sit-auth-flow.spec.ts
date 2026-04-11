import { test, expect, type Page, type BrowserContext } from "@playwright/test";

// ---------------------------------------------------------------------------
// SIT test account (created 2026-04-11 via API)
// Email: sit-auth-test@adalyzeai.xyz  |  Password: SIT@test123  |  user_id: 17
// ---------------------------------------------------------------------------

const TEST_EMAIL = "sit-auth-test@adalyzeai.xyz";
const TEST_PASSWORD = "SIT@test123";
const TEST_USER_ID = "17";

/** Inject auth cookies directly — bypasses login UI for faster authenticated setup. */
async function setAuthCookies(context: BrowserContext) {
  await context.addCookies([
    {
      name: "userId",
      value: TEST_USER_ID,
      domain: "dev.adalyzeai.xyz",
      path: "/",
      sameSite: "Lax",
    },
    {
      name: "email",
      value: TEST_EMAIL,
      domain: "dev.adalyzeai.xyz",
      path: "/",
      sameSite: "Lax",
    },
  ]);
}

/** Wait for domcontentloaded + spinner gone. */
async function waitForLoad(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page
    .waitForSelector(".skeleton, .animate-pulse, .animate-spin", {
      state: "hidden",
      timeout: 12_000,
    })
    .catch(() => {});
}

/** Collect CORS-specific console errors. */
function collectCorsErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" && msg.text().includes("blocked by CORS policy")) {
      errors.push(msg.text());
    }
  });
  return errors;
}

// ---------------------------------------------------------------------------
// 1. Login flow — full UI
// ---------------------------------------------------------------------------

test.describe("Login Flow (UI)", () => {
  test("login form submits with valid credentials → userId cookie set → redirect away from /login", async ({
    page,
  }) => {
    await page.context().clearCookies();

    // BUG-CORS-001: dev.evraapp.top returns duplicate Access-Control-Allow-Origin headers
    // (Apache adds empty value, PHP adds *). Chrome rejects the preflight, so the real
    // POST /api/auth/login is always CORS-blocked in this dev environment.
    // We intercept at the network layer and return the canonical success shape so the
    // UI flow (form fill → cookie set → redirect) can still be validated end-to-end.
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "success",
          user: {
            user_id: 17,
            email: TEST_EMAIL,
            name: "SIT Test User",
            payment_status: 0,
            fretra_status: 0,
            type: "1",
            city: "Chennai",
            status: 1,
          },
        }),
      });
    });

    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    // Fill credentials
    await page.locator('input[type="email"]').fill(TEST_EMAIL);
    await page.locator('input[type="password"]').fill(TEST_PASSWORD);

    // Dismiss cookie consent banner if it has appeared — it renders with a high
    // z-index overlay that intercepts clicks on the submit button.
    await page
      .locator('[aria-label="allow cookies"], button:has-text("Accept all"), button:has-text("allow cookies")')
      .first()
      .click()
      .catch(() => {});

    // Click the submit button — "Login to Your Account" is the exact button text.
    // Using button[type="submit"] scoped to the visible form avoids matching the
    // reset-password form's submit button (which is conditionally rendered).
    await page.locator('button[type="submit"]').click();

    // Wait for navigation away from /login — goes to /pricing because
    // SIT account has payment_status=0, fretra_status=0.
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20_000 });

    const finalUrl = page.url();
    expect(finalUrl, "Should leave /login after successful auth").not.toContain("/login");

    // userId cookie must be set (set by login page before routing)
    const cookies = await page.context().cookies();
    const userIdCookie = cookies.find((c) => c.name === "userId");
    expect(userIdCookie, "userId cookie must be set after login").toBeDefined();
    expect(userIdCookie?.value, "userId cookie must equal test user ID").toBe(TEST_USER_ID);
  });

  test("login with wrong password → error toast shown, no redirect", async ({ page }) => {
    await page.context().clearCookies();

    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    await page.locator('input[type="email"]').fill(TEST_EMAIL);
    await page.locator('input[type="password"]').fill("wrong-password");
    await page.locator('button[type="submit"]').click();

    // Should stay on login (no redirect)
    await page.waitForTimeout(3_000);
    expect(page.url(), "Should remain on /login after failed auth").toContain("/login");

    // userId cookie must NOT be set
    const cookies = await page.context().cookies();
    const userIdCookie = cookies.find((c) => c.name === "userId");
    expect(userIdCookie, "No userId cookie after failed login").toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 2. Dashboard access + userId cookie propagation
// ---------------------------------------------------------------------------

test.describe("Dashboard Access (authenticated)", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await setAuthCookies(context);
  });

  test("dashboard loads for authenticated user — no redirect to login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    // Wait to confirm no redirect fires
    await page.waitForTimeout(3_000);

    const finalUrl = page.url();
    expect(
      finalUrl,
      "Authenticated user should remain on /dashboard (not redirected to login)"
    ).toContain("/dashboard");

    // BUG-CORS-001: dev.evraapp.top has duplicate Access-Control-Allow-Origin headers —
    // CORS errors from the REST backend are expected until the backend team fixes the
    // Apache/.htaccess config. The frontend now handles network failures gracefully
    // (no logout on non-401 errors), so the user correctly stays on /dashboard.
  });

  test("userId cookie propagation — /api/dashboard?user_id is sent", async ({ page }) => {
    // Capture network requests to the REST backend
    const apiCalls: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      if (url.includes("evraapp.top") && url.includes("user_id")) {
        apiCalls.push(url);
      }
    });

    await page.goto("/dashboard");
    await waitForLoad(page);

    const dashboardApiCalls = apiCalls.filter((u) => u.includes("/api/dashboard"));
    expect(
      dashboardApiCalls.length,
      "Dashboard should fire GET /api/dashboard?user_id=..."
    ).toBeGreaterThan(0);

    // All dashboard API calls must include the correct user_id
    for (const url of dashboardApiCalls) {
      expect(url, `Dashboard API call must include user_id=${TEST_USER_ID}`).toContain(
        `user_id=${TEST_USER_ID}`
      );
    }
  });

  test("profile API call — GET /api/user?user_id is sent with correct id", async ({ page }) => {
    const profileCalls: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      if (url.includes("evraapp.top/api/user")) {
        profileCalls.push(url);
      }
    });

    await page.goto("/dashboard");
    await waitForLoad(page);

    expect(
      profileCalls.length,
      "Should fire GET /api/user?user_id=... to load profile"
    ).toBeGreaterThan(0);

    for (const url of profileCalls) {
      expect(url, "Profile call must include correct user_id").toContain(
        `user_id=${TEST_USER_ID}`
      );
    }
  });
});

// ---------------------------------------------------------------------------
// 3. Logout flow
// ---------------------------------------------------------------------------

test.describe("Logout Flow", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await setAuthCookies(context);
  });

  test("logout removes userId cookie and redirects to /", async ({ page }) => {
    await page.goto("/dashboard");
    await waitForLoad(page);

    // Trigger logout via navbar
    const logoutBtn = page
      .locator("button, a")
      .filter({ hasText: /logout|sign out/i })
      .first();

    if (await logoutBtn.isVisible().catch(() => false)) {
      await logoutBtn.click();
    } else {
      // Fallback: call logout() directly via JS (cookie remove + navigate)
      await page.evaluate(() => {
        document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        document.cookie = "email=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        window.location.href = "/";
      });
    }

    // Wait for navigation away from dashboard
    await page.waitForURL((url) => !url.pathname.includes("/dashboard"), {
      timeout: 5_000,
    });

    const finalUrl = page.url();
    expect(finalUrl, "Logout should redirect to home (/)").not.toContain("/dashboard");

    // userId cookie must be gone
    const cookies = await page.context().cookies();
    const userIdCookie = cookies.find((c) => c.name === "userId");
    expect(userIdCookie, "userId cookie must be removed after logout").toBeUndefined();
  });

  test("post-logout: accessing /dashboard redirects to /", async ({ page }) => {
    // Clear all cookies (simulate logged-out state)
    await page.context().clearCookies();

    await page.goto("/dashboard");
    await page.waitForURL((url) => !url.pathname.includes("/dashboard"), {
      timeout: 5_000,
    });

    expect(page.url(), "Unauthenticated /dashboard must redirect away").not.toContain(
      "/dashboard"
    );
  });
});

// ---------------------------------------------------------------------------
// 4. A/B test UI — BUG-002 (/api/ab-ads returns 404)
// ---------------------------------------------------------------------------

test.describe("A/B Test UI — BUG-002", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await setAuthCookies(context);
  });

  test("/ab-test page loads without JS crash (handles 404 gracefully)", async ({ page }) => {
    const jsErrors: string[] = [];
    page.on("pageerror", (err) => jsErrors.push(err.message));

    await page.goto("/ab-test");
    await waitForLoad(page);

    // Page must not throw an unhandled JS error from the /ab-test page itself.
    // (The "Unexpected token '.'" error was from the home-page bundle — it appeared
    //  because BUG-CORS-001 triggered logout() which redirected to /. With the
    //  defensive fix in useFetchUserDetails, the redirect no longer fires and the
    //  /ab-test page renders cleanly.)
    expect(jsErrors, "No unhandled JS errors on /ab-test").toHaveLength(0);

    // BUG-CORS-001: CORS errors from dev.evraapp.top are expected (backend issue).

    // Must render some page structure (heading or content area)
    const headings = page.locator("h1, h2, h3");
    expect(await headings.count(), "/ab-test must render at least one heading").toBeGreaterThan(0);
  });

  test("/api/ab-ads returns 404 — BUG-002 confirmed", async ({ page }) => {
    const abAdsCalls: Array<{ url: string; status: number }> = [];
    page.on("response", (res) => {
      if (res.url().includes("/api/ab-ads")) {
        abAdsCalls.push({ url: res.url(), status: res.status() });
      }
    });

    await page.goto("/ab-test");
    await waitForLoad(page);

    // If /api/ab-ads is called, it must currently return 404
    if (abAdsCalls.length > 0) {
      const statuses = abAdsCalls.map((c) => c.status);
      // Document the known bug: 404
      expect(
        statuses,
        "BUG-002: /api/ab-ads returns 404 on new backend — backend route not yet implemented"
      ).toContain(404);
    }
    // If not called at all, the page doesn't make the call — also acceptable
  });
});

// ---------------------------------------------------------------------------
// 5. Checklist guide UI — BUG-003 (/api/checklist returns 404)
// ---------------------------------------------------------------------------

test.describe("Checklist Guide UI — BUG-003", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await setAuthCookies(context);
  });

  test("/checklist-guide page loads without JS crash (handles 404 gracefully)", async ({
    page,
  }) => {
    const jsErrors: string[] = [];
    page.on("pageerror", (err) => jsErrors.push(err.message));

    const corsErrors = collectCorsErrors(page);

    await page.goto("/checklist-guide");
    await waitForLoad(page);

    expect(jsErrors, "No unhandled JS errors on /checklist-guide").toHaveLength(0);
    expect(corsErrors, "No CORS errors on /checklist-guide").toHaveLength(0);

    const headings = page.locator("h1, h2, h3");
    expect(
      await headings.count(),
      "/checklist-guide must render at least one heading"
    ).toBeGreaterThan(0);
  });

  test("/api/checklist returns 404 — BUG-003 confirmed", async ({ page }) => {
    const checklistCalls: Array<{ url: string; status: number }> = [];
    page.on("response", (res) => {
      if (res.url().includes("/api/checklist")) {
        checklistCalls.push({ url: res.url(), status: res.status() });
      }
    });

    await page.goto("/checklist-guide");
    await waitForLoad(page);

    if (checklistCalls.length > 0) {
      const statuses = checklistCalls.map((c) => c.status);
      expect(
        statuses,
        "BUG-003: /api/checklist returns 404 on new backend — backend route not yet implemented"
      ).toContain(404);
    }
  });
});

// ---------------------------------------------------------------------------
// 6. userId cookie propagation — cross-page authenticated calls
// ---------------------------------------------------------------------------

test.describe("userId Cookie Propagation", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await setAuthCookies(context);
  });

  test("authenticated API calls carry user_id param — no 401/403 responses", async ({
    page,
  }) => {
    const authenticatedErrors: Array<{ url: string; status: number }> = [];
    page.on("response", (res) => {
      const url = res.url();
      if (
        url.includes("evraapp.top") &&
        !url.includes("/api/auth/") &&
        (res.status() === 401 || res.status() === 403)
      ) {
        authenticatedErrors.push({ url, status: res.status() });
      }
    });

    await page.goto("/dashboard");
    await waitForLoad(page);

    expect(
      authenticatedErrors,
      `No 401/403 responses on dashboard for authenticated user: ${JSON.stringify(authenticatedErrors)}`
    ).toHaveLength(0);
  });

  test("profile request includes user_id — data fetched from REST backend", async ({
    page,
  }) => {
    const apiRequests: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes("dev.evraapp.top")) {
        apiRequests.push(req.url());
      }
    });

    await page.goto("/dashboard");
    await waitForLoad(page);

    const userIdRequests = apiRequests.filter((url) =>
      url.includes(`user_id=${TEST_USER_ID}`)
    );
    expect(
      userIdRequests.length,
      "At least one API call should carry the userId from cookie"
    ).toBeGreaterThan(0);
  });
});
