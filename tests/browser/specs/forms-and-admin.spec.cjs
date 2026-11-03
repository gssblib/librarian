const { test, expect, login, ADMIN } = require("./fixtures.cjs");

test("borrower creation and editing persist required fields and dropdown values", async ({
  page,
}) => {
  await login(page);
  await page.goto(ADMIN + "/borrowers/add");
  await expect(
    page.getByRole("button", { name: "Add", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("textbox", { name: "Last name", exact: true })
    .fill("Extra Test");
  await page
    .getByRole("textbox", { name: "First name", exact: true })
    .fill("Clara");
  await page
    .getByRole("textbox", { name: "Contact name", exact: true })
    .fill("Fictional Parent");
  await page
    .getByRole("textbox", { name: /^Email/ })
    .fill("extra@example.invalid");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page).toHaveURL(/\/borrowers\/\d+\/checkouts/);
  await page.getByRole("tab", { name: "Profile", exact: true }).click();
  await expect(page.getByRole("textbox", { name: /^Email/ })).toHaveValue(
    "extra@example.invalid",
  );
  await page
    .getByRole("textbox", { name: "Contact name", exact: true })
    .fill("Updated Fictional Parent");
  await page.getByRole("combobox", { name: /^State/ }).click();
  await page.getByRole("option", { name: "INACTIVE", exact: true }).click();
  await page.getByRole("textbox", { name: /^Email/ }).fill("");
  await expect(
    page.getByRole("button", { name: "Save", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("textbox", { name: /^Email/ })
    .fill("updated@example.invalid");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByText("Borrower saved.", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "Contact name", exact: true }),
  ).toHaveValue("Updated Fictional Parent");
  await expect(page.getByRole("textbox", { name: /^Email/ })).toHaveValue(
    "updated@example.invalid",
  );
  await expect(page.getByRole("combobox", { name: /^State/ })).toContainText(
    "INACTIVE",
  );
});

test.describe("calendar dates in a non-UTC browser", () => {
  test.use({ timezoneId: "America/New_York" });
  test("calendar selection reaches the API unchanged and computed fees survive reload", async ({
    page,
  }) => {
    await login(page);
    await page.goto(ADMIN + "/fees");
    const parts = await page.evaluate(() => {
      const d = new Date();
      return [d.getFullYear(), d.getMonth()];
    });
    const target = new Date(Date.UTC(parts[0], parts[1] + 1, 15));
    const date = target.toISOString().slice(0, 10);
    const label = target.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
    await page
      .getByRole("button", { name: "Open calendar", exact: true })
      .click();
    await page.getByRole("button", { name: "Next month", exact: true }).click();
    await page.getByRole("button", { name: label, exact: true }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    const update = page.waitForResponse(
      (r) =>
        r.url().endsWith("/api/checkouts/updateFees") &&
        r.request().method() === "POST",
    );
    await page
      .getByRole("button", { name: "Update Fees", exact: true })
      .click();
    const response = await update;
    expect(response.request().postDataJSON()).toEqual({ date });
    expect(response.status()).toBe(200);
    await expect(
      page.getByText("Fees updated!", { exact: true }),
    ).toBeVisible();
    await page.reload();
    const row = page.getByRole("row").filter({ hasText: "Beispiel" });
    await expect(row).toContainText("0.5");
    await page.screenshot({
      animations: "disabled",
      path: test.info().outputPath("fees-after-calendar-selection.png"),
    });
  });
});

test("administration tabs, file selection and canceling queue deletion work", async ({
  page,
}) => {
  await login(page);
  await page.goto(ADMIN + "/admin/antolin");
  await expect(
    page.getByRole("button", { name: "Sync", exact: true }),
  ).toBeEnabled();
  await page.getByRole("tab", { name: "Families", exact: true }).click();
  await page.locator("input[type=file]").setInputFiles({
    name: "fictional-families.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("Family Name\nExample\n"),
  });
  await expect(
    page.getByText("fictional-families.csv", { exact: true }),
  ).toBeVisible();
  // File selection only: no external synchronization or family import is needed.
  await page
    .getByRole("tab", { name: "Labels Print Queue", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "Fictional test label", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear Queue", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Clearing Label Print Queue",
  );
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "No", exact: true })
    .click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("link", { name: "Fictional test label", exact: true }),
  ).toBeVisible();
});

test("order-cycle details and canceling deletion preserve the cycle", async ({
  page,
}) => {
  await login(page);
  await page.goto(ADMIN + "/ordercycles");
  await expect(page.getByRole("row").filter({ hasText: "OPEN" })).toBeVisible();
  await page.getByTitle("Confirm deletion", { exact: true }).click();
  await page.screenshot({
    animations: "disabled",
    path: test.info().outputPath("cycle-delete-dialog.png"),
  });
  await expect(page.getByRole("dialog")).toContainText(
    "delete the order cycle",
  );
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "No", exact: true })
    .click();
  await page.reload();
  await page.getByRole("cell", { name: "OPEN", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Order cycle 1 (OPEN)", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("No orders", { exact: true })).toBeVisible();
});

test("report filters and native date inputs survive reload and export CSV", async ({
  page,
}) => {
  await login(page);
  // The usage report includes historical loans, not books never borrowed.
  await page.goto(ADMIN + "/borrowers/90002/checkouts");
  await page.getByPlaceholder("Barcode", { exact: true }).fill("900000001");
  await page.getByPlaceholder("Barcode", { exact: true }).press("Enter");
  await expect(
    page.getByRole("link", { name: "Test Book 01", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Return", exact: true }).click();
  await expect(
    page.getByText("No items checked out.", { exact: true }),
  ).toBeVisible();
  const date = `${new Date().getUTCFullYear() + 1}-01-15`;
  await page.goto(ADMIN + "/reports/item-usage");
  await page.getByRole("combobox", { name: /^Category/ }).click();
  await page.getByRole("option", { name: "Buch", exact: true }).click();
  await page.getByPlaceholder("Last Checkout Date", { exact: true }).fill(date);
  await page.getByTitle("Search", { exact: true }).click();
  await expect(
    page.getByRole("cell", { name: "Test Book 01", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByPlaceholder("Last Checkout Date", { exact: true }),
  ).toHaveValue(date);
  await expect(page.getByRole("combobox", { name: /^Category/ })).toContainText(
    "Buch",
  );
  const pending = page.waitForEvent("download");
  await page
    .locator("button")
    .filter({ has: page.locator("mat-icon").filter({ hasText: /^save$/ }) })
    .click();
  const download = await pending;
  await page.screenshot({
    animations: "disabled",
    path: test.info().outputPath("item-usage-report.png"),
  });
  expect(download.suggestedFilename()).toBe("report.csv");
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  expect(Buffer.concat(chunks).toString()).toContain("Test Book 01");
  await page.getByRole("tab", { name: "Overdue", exact: true }).click();
  await page.getByPlaceholder("Last Checkout Date", { exact: true }).fill(date);
  await page.getByTitle("Search", { exact: true }).click();
  await expect(page.getByRole("cell", { name: /Beispiel/ })).toBeVisible();
  await page.reload();
  await expect(
    page.getByPlaceholder("Last Checkout Date", { exact: true }),
  ).toHaveValue(date);
  await expect(page.getByRole("cell", { name: /Beispiel/ })).toBeVisible();
});
