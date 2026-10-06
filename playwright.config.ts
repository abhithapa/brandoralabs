import { defineConfig, devices } from "@playwright/test";

/**
 * Critical browser flows. Expects a built app and a migrated test database:
 *   npm run build && npm run test:e2e
 * Uses the `log` email transport — no real emails are sent.
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL: "http://localhost:3100", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 360, height: 780 } } },
  ],
  webServer: {
    command: "npx next start -p 3100",
    url: "http://localhost:3100/api/health",
    reuseExistingServer: !process.env.CI,
    env: { SITE_URL: "http://localhost:3100", EMAIL_TRANSPORT: "log" },
  },
});
