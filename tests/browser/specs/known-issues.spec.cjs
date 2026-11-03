const { test, expect, login, PUBLIC, ADMIN } = require("./fixtures.cjs");

// These run against unchanged application code. An unexpected pass makes the
// suite fail, prompting removal of the annotation after the bug is fixed.
test("public failed login displays its error and enables another attempt", async ({
  page,
}) => {
  const authentication = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/authenticate") &&
      response.request().method() === "POST",
  );
  await login(page, {
    publicSite: true,
    password: "incorrect-family-password",
  });
  expect((await authentication).status()).toBe(401);
  expect(
    await page.evaluate(() => localStorage.getItem("currentUser")),
  ).toBeNull();
  test.fail(
    true,
    "Existing Angular 16 public login stays loading after a 401; see README known issues.",
  );
  await expect(
    page.getByText("Username or password is incorrect", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Login", exact: true }),
  ).toBeEnabled();
});

test.describe("existing order-cycle date/time form", () => {
  const missingType =
    '[Formly Error] The type "datetimepicker" could not be found.';
  test.use({ allowedAngularConsoleError: missingType });
  test("order-cycle start and end controls render for editing and creation", async ({
    page,
  }) => {
    const errors = [];
    page.on("console", (message) => {
      if (message.type() === "error" && message.text().includes(missingType))
        errors.push(message.text());
    });
    await login(page);
    await page.goto(ADMIN + "/ordercycles");
    await page.getByTitle("Edit order cycle", { exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Edit order cycle", exact: true }),
    ).toBeVisible();
    await expect.poll(() => errors.length).toBeGreaterThanOrEqual(2);
    await page.goto(ADMIN + "/ordercycles/add");
    await expect(
      page.getByRole("heading", { name: "Add order cycle", exact: true }),
    ).toBeVisible();
    await expect.poll(() => errors.length).toBeGreaterThanOrEqual(4);
    // Verified against the local Angular 16.2.12 app as well as Angular 22.
    // Only this exact existing console error is permitted; new errors still fail.
    test.fail(
      true,
      "Existing Formly datetimepicker type is not registered; see README known issues.",
    );
    await expect(
      page.getByRole("textbox", { name: "Start", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "End", exact: true }),
    ).toBeVisible();
  });
});

test("a family can place an order and see it after reload", async ({
  page,
}) => {
  await login(page, { publicSite: true });
  await page.goto(PUBLIC + "/items");
  await page.getByLabel("Title", { exact: true }).fill("Test Book 01");
  await page.getByTitle("Search", { exact: true }).click();
  const orderResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/items/900000001/order") &&
      response.request().method() === "POST",
  );
  await page
    .locator("gsl-catalog-item-card")
    .filter({ hasText: "Test Book 01" })
    .getByRole("button", { name: "Order", exact: true })
    .click();
  const response = await orderResponse;
  // Do not classify a different server/authentication failure as this known bug.
  if (response.status() !== 200) {
    expect(response.status()).toBe(500);
    expect(await response.text()).toMatch(
      /reading (?:'|&#39;)borrower(?:'|&#39;)/,
    );
  }
  test.fail(
    true,
    "Existing order permission check reads undefined action.params.borrower and returns 500; see README known issues.",
  );
  expect(response.status()).toBe(200);
  await page.getByRole("link", { name: /Order$/ }).click();
  await expect(
    page.getByRole("cell", { name: "Test Book 01", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("cell", { name: "Test Book 01", exact: true }),
  ).toBeVisible();
});
