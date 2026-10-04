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
          reuseExistingServer: true,
        },
        {
          command:
            "pnpm --filter @poetry/web build && node tests/fixtures/serve-web.mjs",
          url: "http://localhost:4321/de",
          reuseExistingServer: true,
          env: {
            PREVIEW_SECRET: "test-preview",
            PUBLIC_CMS_URL: "http://127.0.0.1:3001",
          },
        },
      ],
});
