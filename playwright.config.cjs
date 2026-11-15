const { defineConfig } = require("@playwright/test");
const path = require("path");
const db = "agrochrono_browser_" + Date.now();
const python =
  process.platform === "win32"
    ? '"' + path.resolve(".venv/Scripts/python.exe") + '"'
    : "python";
module.exports = defineConfig({
  testDir: "./test/browser",
  timeout: 90000,
  expect: { timeout: 15000 },
  workers: 1,
  reporter: [
    ["list"],
    ["json", { outputFile: ".local/evidence/browser-results.json" }],
  ],
  outputDir: ".local/browser-results",
  use: {
    baseURL: "http://127.0.0.1:4179",
    browserName: "chromium",
    headless: true,
    launchOptions: process.env.CHROME_EXECUTABLE
      ? { executablePath: process.env.CHROME_EXECUTABLE }
      : {},
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: `${python} -m uvicorn main:app --app-dir ml-service --host 127.0.0.1 --port 8019`,
      url: "http://127.0.0.1:8019/health",
      timeout: 120000,
      env: { ML_SERVICE_TOKEN: "browser-test-service-token" },
    },
    {
      command: "node test/support/browser-server.cjs",
      url: "http://127.0.0.1:5019/api/options",
      env: {
        MONGODB_URI:
          process.env.TEST_MONGODB_URI || "mongodb://127.0.0.1:27029",
        MONGODB_DB_NAME: db,
        SESSION_SECRET: "isolated-browser-session-secret-over-32-characters",
        APP_ORIGIN: "http://127.0.0.1:4179",
        ML_SERVICE_URL: "http://127.0.0.1:8019",
        ML_SERVICE_TOKEN: "browser-test-service-token",
      },
    },
    {
      command: "npm --prefix frontend run preview -- --port 4179 --strictPort",
      url: "http://127.0.0.1:4179",
      env: { VITE_BACKEND_URL: "http://127.0.0.1:5019" },
    },
  ],
});
