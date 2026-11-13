import { defineConfig, devices } from "@playwright/test";
import fs from "node:fs";

const localChrome =
  !process.env.CI && fs.existsSync("/usr/bin/google-chrome-stable")
    ? "/usr/bin/google-chrome-stable"
    : undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3106",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: localChrome ? { executablePath: localChrome } : undefined,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run preview -- --port 3106",
    url: "http://127.0.0.1:3106",
    reuseExistingServer: false,
  },
});
