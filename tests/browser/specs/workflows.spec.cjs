const {
  test,
  expect,
  login,
  search,
  ADMIN,
  PUBLIC,
} = require("./fixtures.cjs");

test("admin login survives reload; logout removes authenticated access", async ({
  page,
  request,
}) => {
  await login(page);
  await page.reload();
  await expect(
    page.getByText("Welcome, test-admin!", { exact: true }),
  ).toBeVisible();
  await page.locator("mat-nav-list a").filter({ hasText: "Logout" }).click();
  await expect(
    page.getByText("Welcome, test-admin!", { exact: true }),
  ).toHaveCount(0);
  expect((await request.get(ADMIN + "/api/checkouts")).status()).toBe(401);
  expect(
    await page.evaluate(() => localStorage.getItem("currentUser")),
  ).toBeNull();
});

test("invalid admin password is rejected without creating a session", async ({
  page,
}) => {
  await login(page, { password: "incorrect-test-password" });
  await expect(
    page.getByText("Username or password is incorrect", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("currentUser")),
  ).toBeNull();
});

test("catalog search, pagination, sort and author filter return expected records", async ({
  page,
}) => {
  await login(page);
  await search(page);
  await expect(
    page.getByRole("heading", { name: "Found 14 matching items" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Test Book 11", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Test Book 01", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Previous page", exact: true })
    .click();
  await page.getByRole("button", { name: "Title", exact: true }).click();
  await expect(page.locator("mat-row").first()).toContainText("Test Book 14");
  await page.reload();
  await expect(page.locator("mat-row").first()).toContainText("Test Book 14");
  await page.getByLabel("Author", { exact: true }).fill("Ada Beispiel");
  await page.getByTitle("Search", { exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Found 7 matching items" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Test Book 02", exact: true }),
  ).toHaveCount(0);
});

test("book details and its locally stored cover load", async ({ page }) => {
  await login(page);
  await search(page, "Test Book 01");
  await page.getByRole("link", { name: "Test Book 01", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /Item 900000001: Test Book 01/ }),
  ).toBeVisible();
  await expect(page.locator("gsl-item-edit-cover img")).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator("gsl-item-edit-cover img")
        .evaluate((img) => img.naturalWidth),
    )
    .toBeGreaterThan(0);
});

test("book form validates required title and persists an edit through reload", async ({
  page,
}) => {
  await login(page);
  await page.goto(ADMIN + "/items/900000001/details");
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByRole("textbox", { name: /^Title/ }).fill("");
  await expect(
    page.getByRole("button", { name: "Save", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("textbox", { name: /^Title/ })
    .fill("Updated fictional title");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Item saved.", { exact: true })).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: /Updated fictional title/ }),
  ).toBeVisible();
});

test("borrower search opens the intended family and its loan", async ({
  page,
}) => {
  await login(page);
  await page.goto(ADMIN + "/borrowers");
  await page.getByLabel("Last name", { exact: true }).fill("Beispiel");
  await page.getByTitle("Search", { exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Found 1 matching borrowers" }),
  ).toBeVisible();
  await page.getByRole("cell", { name: "Beispiel", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /Beispiel, Ada/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Test Book 14", exact: true }),
  ).toBeVisible();
});

test("checkout, renewal and return persist in loan history", async ({
  page,
}) => {
  await login(page);
  await page.goto(ADMIN + "/borrowers/90001/checkouts");
  const dueCell = page
    .getByRole("row")
    .filter({ hasText: "Test Book 14" })
    .locator(".mat-column-date_due");
  const previousDue = await dueCell.innerText();
  const renewal = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/items/900000014/renew") &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Renew", exact: true }).click();
  expect((await renewal).status()).toBe(200);
  await page.reload();
  await expect(dueCell).not.toHaveText(previousDue);
  expect(Date.parse(await dueCell.innerText())).toBeGreaterThan(
    Date.parse(previousDue),
  );
  await page.goto(ADMIN + "/borrowers/90002/checkouts");
  await expect(
    page.getByText("No items checked out.", { exact: true }),
  ).toBeVisible();
  await page.getByPlaceholder("Barcode", { exact: true }).fill("900000001");
  await page.getByPlaceholder("Barcode", { exact: true }).press("Enter");
  await expect(
    page.getByRole("link", { name: "Test Book 01", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("link", { name: "Test Book 01", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Return", exact: true }).click();
  await expect(
    page.getByText("No items checked out.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "History", exact: true }).click();
  await expect(
    page.getByRole("cell", { name: "Test Book 01", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("cell", { name: "Test Book 01", exact: true }),
  ).toBeVisible();
});

test("canceling the delete confirmation preserves the book", async ({
  page,
}) => {
  await login(page);
  await page.goto(ADMIN + "/items/900000001/details");
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Are you sure you want to delete the item?",
  );
  await expect(page.getByRole("dialog")).toHaveScreenshot(
    "delete-confirmation.png",
  );
  await page.getByRole("button", { name: "No", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: /Item 900000001: Test Book 01/ }),
  ).toBeVisible();
});

test("public login uses the school stub and retains borrower permissions", async ({
  page,
  request,
}) => {
  await page.goto(PUBLIC + "/items");
  await expect(page).toHaveURL(/\/login/);
  await login(page, { publicSite: true });
  await page.reload();
  await expect(
    page.getByText("Welcome Beispiel family!", { exact: true }),
  ).toBeVisible();
  const token = await page.evaluate(
    () => JSON.parse(localStorage.getItem("currentUser")).token,
  );
  expect(
    (
      await request.get(PUBLIC + "/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
    ).status(),
  ).toBe(401);
});

test("public catalog search returns the intended available book", async ({
  page,
}) => {
  await login(page, { publicSite: true });
  await page.goto(PUBLIC + "/items");
  await page.getByLabel("Title", { exact: true }).fill("Test Book 01");
  await page.getByTitle("Search", { exact: true }).click();
  const card = page
    .locator("gsl-catalog-item-card")
    .filter({ hasText: "Test Book 01" });
  await expect(page.locator("gsl-catalog-item-card")).toHaveCount(1);
  await expect(
    card.getByRole("button", { name: "Order", exact: true }),
  ).toBeEnabled();
  await page.reload();
  await expect(page.locator("gsl-catalog-item-card")).toHaveCount(1);
  await expect(card).toContainText("Ada Beispiel");
});

test("public borrower sees existing loans without staff mutation controls", async ({
  page,
}) => {
  await login(page, { publicSite: true });
  await page.goto(PUBLIC + "/checkedout");
  await expect(
    page.getByRole("link", { name: "Test Book 14", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Return", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Renew", exact: true }),
  ).toHaveCount(0);
});

test("catalog layout and navigation match desktop and narrow baselines", async ({
  page,
}) => {
  await login(page);
  await search(page, "Test Book 01");
  await expect(
    page.getByRole("heading", { name: "Found 1 matching items" }),
  ).toBeVisible();
  await page.locator("body").click({ position: { x: 1300, y: 950 } });
  await expect(page).toHaveScreenshot("catalog-desktop.png", {
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("mat-toolbar button").first().click();
  await expect(
    page.getByRole("link", { name: /Borrowers$/ }),
  ).not.toBeVisible();
  await expect(page).toHaveScreenshot("catalog-narrow.png", { fullPage: true });
  await page.locator("mat-toolbar button").first().click();
  await expect(page.getByRole("link", { name: /Borrowers$/ })).toBeVisible();
});
