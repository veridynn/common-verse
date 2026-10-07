import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:4321",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.CI
    ? undefined
    : [
        {
          command: "node tests/fixtures/mock-cms.mjs",
          url: "http://127.0.0.1:3001/health",
          reuseExistingServer: false,
        },
        {
          command:
            "pnpm --filter @poetry/web build && node tests/fixtures/serve-web.mjs",
          url: "http://localhost:4321/de",
          reuseExistingServer: false,
          env: {
            // Build and runtime use different values to detect embedded secrets.
            PREVIEW_SECRET: "build-preview",
            PLAYWRIGHT_PREVIEW_SECRET: "test-preview",
            PUBLIC_CMS_URL: "http://127.0.0.1:3001",
          },
        },
      ],
});
