import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for Adalyze AI SIT (System Integration Testing).
 *
 * Tests run against the LIVE deployed site at https://dev.adalyzeai.xyz.
 * No mocking, no stubs — all assertions validate real API data.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // SIT = real failures, no retries
  workers: process.env.CI ? 1 : 2,
  reporter: [["html", { open: "never" }]],

  timeout: 15_000,

  use: {
    baseURL: "https://dev.adalyzeai.xyz",
    navigationTimeout: 20_000,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    // Chromium only for SIT
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
