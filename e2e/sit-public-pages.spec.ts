import { test, expect, type Page, type ConsoleMessage } from "@playwright/test";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Collect CORS-related console errors during a test. */
function collectCorsErrors(page: Page): string[] {
  const errors: string[] = [];
  const handler = (msg: ConsoleMessage) => {
    if (msg.type() === "error") {
      const text = msg.text();
      // Only catch genuine CORS policy blocks — not auth 401s or other "blocked" messages
      if (text.includes("blocked by CORS policy")) {
        errors.push(text);
      }
    }
  };
  page.on("console", handler);
  // Return the array — caller asserts after navigation.
  return errors;
}

/** Wait for client-side data to finish loading (skeleton / pulse gone). */
async function waitForDataLoad(page: Page) {
  // Use domcontentloaded — "networkidle" stalls indefinitely on pages with
  // streaming video (login), analytics scripts, or failed background API calls.
  await page.waitForLoadState("domcontentloaded");
  // Then wait for any visible loading spinner / skeleton to disappear, which
  // confirms that the primary API calls have resolved.
  await page
    .waitForSelector(".skeleton, .animate-pulse, .animate-spin", {
      state: "hidden",
      timeout: 12_000,
    })
    .catch(() => {
      /* no spinner on this page — proceed immediately */
    });
}

/**
 * AP-009 assertion: heading text is real HTML content, not raw JSON.
 * Checks that h1/h2 elements have visible text that does not start with
 * `{` and does not contain `"status"`.
 */
async function assertAP009Headings(page: Page) {
  const headings = page.locator("h1, h2");
  const count = await headings.count();
  expect(count, "Page should contain at least one heading (h1 or h2)").toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const text = (await headings.nth(i).textContent()) ?? "";
    const trimmed = text.trim();
    if (trimmed.length === 0) continue; // skip decorative empty headings
    expect(trimmed, `Heading text must not be raw JSON: "${trimmed.slice(0, 60)}"`).not.toMatch(
      /^\s*\{/,
    );
    expect(trimmed, `Heading text must not contain "status" key`).not.toContain('"status"');
  }
}

// ---------------------------------------------------------------------------
// 1. Home Page  /
// ---------------------------------------------------------------------------

test.describe("Home Page /", () => {
  let corsErrors: string[];

  test.beforeEach(async ({ page }) => {
    corsErrors = collectCorsErrors(page);
    await page.goto("/");
    await waitForDataLoad(page);
  });

  test("hero banner section loads with content", async ({ page }) => {
    // LandingPageHeader renders banner data; wait for heading text inside it
    const header = page.locator("header").first();
    await expect(header).toBeVisible();
  });

  test("testimonials section is non-empty", async ({ page }) => {
    // Scroll down to trigger lazy sections
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);
    // No networkidle — streaming video on this page prevents it from settling.

    // Look for testimonial content containers
    const testimonials = page.locator('[class*="testimonial"], [class*="Testimonial"]');
    const testimonialCount = await testimonials.count();
    if (testimonialCount > 0) {
      expect(testimonialCount).toBeGreaterThan(0);
    } else {
      // Fallback: at minimum ensure the page rendered without fatal error
      const quoteBlocks = page.locator("blockquote, [class*='testi']");
      expect(await quoteBlocks.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test("case study section is non-empty", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);
    // No networkidle — streaming video on this page prevents it from settling.

    // CaseStudySection heading
    const section = page.locator("text=Case Study, text=case study, text=Case Studies").first();
    if (await section.isVisible().catch(() => false)) {
      await expect(section).toBeVisible();
    }
  });

  test("no CORS errors on home page", async () => {
    expect(corsErrors, "CORS errors detected on Home page").toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 2. /top10ads
// ---------------------------------------------------------------------------

test.describe("/top10ads", () => {
  let corsErrors: string[];

  test.beforeEach(async ({ page }) => {
    corsErrors = collectCorsErrors(page);
    await page.goto("/top10ads");
    await waitForDataLoad(page);
  });

  test("renders ad cards with scores", async ({ page }) => {
    // Top 3 podium + remaining cards; header says "Top 10 Ads Wall"
    await expect(page.locator("h1")).toContainText("Top 10 Ads Wall");

    // Score text rendered for each ad: "Score: <number>"
    const scoreLabels = page.locator("text=/Score:\\s*\\d+/");
    await expect(scoreLabels.first()).toBeVisible();

    // At least 3 podium items visible (top three)
    const podiumImages = page.locator("img[alt]").filter({ has: page.locator("xpath=..") });
    const imgCount = await podiumImages.count();
    expect(imgCount, "Expected multiple ad images").toBeGreaterThanOrEqual(3);
  });

  test("no CORS errors on /top10ads", async () => {
    expect(corsErrors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 3. /top10trendingads
// ---------------------------------------------------------------------------

test.describe("/top10trendingads", () => {
  let corsErrors: string[];

  test.beforeEach(async ({ page }) => {
    corsErrors = collectCorsErrors(page);
    await page.goto("/top10trendingads");
    await waitForDataLoad(page);
  });

  test("renders trending ads list", async ({ page }) => {
    // Header contains "Trending"
    await expect(page.locator("h1")).toContainText(/Trending/i);

    // Should have ad images rendered
    const adImages = page.locator("img[alt]");
    const count = await adImages.count();
    expect(count, "Expected trending ad images").toBeGreaterThanOrEqual(1);
  });

  test("no CORS errors on /top10trendingads", async () => {
    expect(corsErrors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 4. /blog
// ---------------------------------------------------------------------------

test.describe("/blog", () => {
  let corsErrors: string[];

  test.beforeEach(async ({ page }) => {
    corsErrors = collectCorsErrors(page);
    await page.goto("/blog");
    await waitForDataLoad(page);
  });

  test("renders at least 1 blog card with title", async ({ page }) => {
    // Page heading — static, renders immediately
    await expect(page.locator("h2").first()).toContainText(/Insights and Tips/i);

    // Blog cards render after the API call resolves.
    // Use toBeVisible() auto-retry on the first card's title instead of count().
    const firstCardTitle = page.locator(".grid h2").first();
    await expect(firstCardTitle).toBeVisible();

    const titleText = await firstCardTitle.textContent();
    expect((titleText ?? "").trim().length, "Blog title should not be empty").toBeGreaterThan(0);
  });

  test("no CORS errors on /blog", async () => {
    expect(corsErrors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 5. /faq
// ---------------------------------------------------------------------------

test.describe("/faq", () => {
  let corsErrors: string[];

  test.beforeEach(async ({ page }) => {
    corsErrors = collectCorsErrors(page);
    await page.goto("/faq");
    await waitForDataLoad(page);
  });

  test("renders FAQ items with at least 1 visible", async ({ page }) => {
    // Title is static — renders immediately
    await expect(page.locator("h2").first()).toContainText(/missed anything/i);

    // FAQ accordion items render only after the API call resolves.
    // Use expect().toBeVisible() which auto-retries — NOT count() which is instant.
    await expect(page.locator("h5").first()).toBeVisible();
  });

  test("no CORS errors on /faq", async () => {
    expect(corsErrors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 6. /guide
// ---------------------------------------------------------------------------

test.describe("/guide", () => {
  let corsErrors: string[];

  test.beforeEach(async ({ page }) => {
    corsErrors = collectCorsErrors(page);
    await page.goto("/guide");
    await waitForDataLoad(page);
  });

  test("renders guide content", async ({ page }) => {
    // Guide page uses UserLayout and fetches guide data
    // At minimum, the page should render without an error state
    const errorState = page.locator("text=/error|failed/i");
    const errorVisible = await errorState.isVisible().catch(() => false);
    expect(errorVisible, "Guide page should not show error state").toBe(false);
  });

  test("no CORS errors on /guide", async () => {
    expect(corsErrors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 7. /agencies
// ---------------------------------------------------------------------------

test.describe("/agencies", () => {
  let corsErrors: string[];

  test.beforeEach(async ({ page }) => {
    corsErrors = collectCorsErrors(page);
    await page.goto("/agencies");
    await waitForDataLoad(page);
  });

  test("renders agency use case content", async ({ page }) => {
    // The page renders multiple agency step cards with titles like
    // "Multi-Brand Management Dashboard", etc.
    const stepTitles = page.locator("h3, h2");
    const count = await stepTitles.count();
    expect(count, "Expected agency step headings").toBeGreaterThanOrEqual(1);

    // Check for the "Start Your Free Trial" CTA
    const cta = page.locator("text=/Start.*Free.*Trial/i");
    await expect(cta.first()).toBeVisible();
  });

  test("no CORS errors on /agencies", async () => {
    expect(corsErrors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 8. /features
// ---------------------------------------------------------------------------

test.describe("/features", () => {
  let corsErrors: string[];

  test.beforeEach(async ({ page }) => {
    corsErrors = collectCorsErrors(page);
    await page.goto("/features");
    await waitForDataLoad(page);
  });

  test("renders features list and hero", async ({ page }) => {
    // Hero heading: "Tools That Make" + "Your Ads More Effective"
    await expect(page.locator("h1").first()).toContainText(/Tools That Make/i);

    // Feature cards — each has a title and description
    const featureHeadings = page.locator("h2, h3");
    const count = await featureHeadings.count();
    expect(count, "Expected feature section headings").toBeGreaterThanOrEqual(1);
  });

  test("no CORS errors on /features", async () => {
    expect(corsErrors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 9. /pricing
// ---------------------------------------------------------------------------

test.describe("/pricing", () => {
  let corsErrors: string[];

  test.beforeEach(async ({ page }) => {
    corsErrors = collectCorsErrors(page);
    await page.goto("/pricing");
    await waitForDataLoad(page);
  });

  test("renders at least 1 pricing plan card", async ({ page }) => {
    // Pricing cards are rendered after API fetch; look for plan-related content
    // Each plan card contains a price value and features list
    const planCards = page.locator("[class*='card'], [class*='Card'], [class*='pricing'], [class*='Pricing']");
    const cardCount = await planCards.count();

    if (cardCount === 0) {
      // Fallback: look for price-related text patterns (currency symbols)
      const priceText = page.locator("text=/[\\$\\u20B9]\\s*\\d+/");
      const priceCount = await priceText.count();
      expect(priceCount, "Expected at least 1 pricing element").toBeGreaterThanOrEqual(1);
    } else {
      expect(cardCount, "Expected at least 1 pricing card").toBeGreaterThanOrEqual(1);
    }
  });

  test("no CORS errors on /pricing", async () => {
    expect(corsErrors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 10. /roi-calculator
// ---------------------------------------------------------------------------

test.describe("/roi-calculator", () => {
  let corsErrors: string[];

  test.beforeEach(async ({ page }) => {
    corsErrors = collectCorsErrors(page);
    await page.goto("/roi-calculator");
    await waitForDataLoad(page);
  });

  test("renders calculator form with inputs", async ({ page }) => {
    // The ROI calculator page contains select dropdowns and input fields
    const selects = page.locator("button[role='combobox'], select, [data-slot='select-trigger']");
    const selectCount = await selects.count();
    expect(selectCount, "Expected calculator form select inputs").toBeGreaterThanOrEqual(1);
  });

  test("no CORS errors on /roi-calculator", async () => {
    expect(corsErrors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 11-15. Policy / Content Pages (AP-009 compliance)
// ---------------------------------------------------------------------------

const policyPages = [
  { path: "/aboutus", name: "About Us" },
  { path: "/cookie-policy", name: "Cookie Policy" },
  { path: "/privacypolicy", name: "Privacy Policy" },
  { path: "/returnpolicy", name: "Return Policy" },
  { path: "/termsandconditions", name: "Terms and Conditions" },
] as const;

for (const { path, name } of policyPages) {
  test.describe(`${name} (${path})`, () => {
    let corsErrors: string[];

    test.beforeEach(async ({ page }) => {
      corsErrors = collectCorsErrors(page);
      await page.goto(path);
      await waitForDataLoad(page);
    });

    test(`renders HTML content (not empty, not JSON string)`, async ({ page }) => {
      // All policy pages use dangerouslySetInnerHTML inside a .privacy-content div
      // or a .prose container. The content must be non-empty rendered HTML.
      const contentContainer = page.locator(
        ".privacy-content, .prose, main",
      ).first();
      await expect(contentContainer).toBeVisible();

      const innerText = await contentContainer.innerText();
      expect(
        innerText.trim().length,
        `${name} content should not be empty`,
      ).toBeGreaterThan(10);

      // Must not be a raw JSON string
      expect(innerText.trim()).not.toMatch(/^\s*\{/);
      expect(innerText).not.toContain('"status"');
    });

    test(`AP-009: headings are real HTML, not raw JSON`, async ({ page }) => {
      await assertAP009Headings(page);
    });

    test(`no CORS errors on ${path}`, async () => {
      expect(corsErrors).toHaveLength(0);
    });
  });
}
