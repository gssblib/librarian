const fs = require("node:fs");
const path = require("node:path");
const { test: base, expect } = require("@playwright/test");
const ADMIN = "http://127.0.0.1:4242";
const PUBLIC = "http://127.0.0.1:4243";
const test = base.extend({
  allowedAngularConsoleError: [null, { option: true }],
  isolatedData: [
    async ({ request }, use) => {
      const state = JSON.parse(
        fs.readFileSync(path.join(__dirname, "../.run.json")),
      );
      expect(state.environment).toBe("disposable-browser-test");
      const reset = await request.post(ADMIN + "/__e2e/reset", {
        headers: { "x-e2e-token": state.token },
      });
      expect(reset.status()).toBe(204);
      await use();
    },
    { auto: true },
  ],
  context: async ({ context }, use) => {
    await context.route("**/*", (route) => {
      const url = new URL(route.request().url());
      return [ADMIN, PUBLIC].includes(url.origin)
        ? route.continue()
        : route.abort("blockedbyclient");
    });
    await use(context);
  },
  page: async ({ page, allowedAngularConsoleError }, use, testInfo) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    // Angular catches many rendering errors and reports them to the console
    // instead of dispatching an uncaught browser pageerror.
    page.on("console", (message) => {
      if (message.type() !== "error" || !/^ERROR\b/.test(message.text()))
        return;
      if (
        allowedAngularConsoleError &&
        message.text().includes(allowedAngularConsoleError)
      )
        return;
      errors.push(message.text());
    });
    await use(page);
    // A known-bug annotation must not turn an unrelated rendering error into
    // an expected failure. Only the explicitly allowed message is exempt.
    if (errors.length) testInfo.expectedStatus = "passed";
    expect(errors, "Unexpected browser JavaScript errors").toEqual([]);
  },
});
async function login(page, { publicSite = false, password } = {}) {
  await page.goto((publicSite ? PUBLIC : ADMIN) + "/login");
  await page
    .getByPlaceholder("Login", { exact: true })
    .fill(publicSite ? "test-family" : "test-admin");
  await page
    .getByPlaceholder("Password", { exact: true })
    .fill(password || (publicSite ? "family-password" : "test-password"));
  await page.getByRole("button", { name: "Login", exact: true }).click();
  if (!password)
    await expect(
      page.getByText(
        publicSite ? "Welcome Beispiel family!" : "Welcome, test-admin!",
        { exact: true },
      ),
    ).toBeVisible();
}
async function search(page, title = "Test Book") {
  await page.goto(ADMIN + "/items");
  await page.getByLabel("Title", { exact: true }).fill(title);
  await page.getByTitle("Search", { exact: true }).click();
}
module.exports = { test, expect, login, search, ADMIN, PUBLIC };
