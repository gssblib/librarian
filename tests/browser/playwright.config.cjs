const { defineConfig } = require("@playwright/test");
module.exports = defineConfig({
  testDir: "./specs",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30000,
  expect: {
    timeout: 7000,
    toHaveScreenshot: { animations: "disabled", maxDiffPixels: 100 },
  },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    browserName: "chromium",
    baseURL: "http://127.0.0.1:4242",
    viewport: { width: 1440, height: 1000 },
    locale: "en-US",
    timezoneId: "UTC",
    serviceWorkers: "block",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "node harness.cjs",
    url: "http://127.0.0.1:4242/__e2e/ready",
    reuseExistingServer: false,
    timeout: 90000,
    gracefulShutdown: { signal: "SIGTERM", timeout: 15000 },
  },
});
