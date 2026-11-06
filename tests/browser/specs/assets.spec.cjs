const { test, expect, login, ADMIN } = require("./fixtures.cjs");

test("a dropped book cover uploads and survives a reload", async ({ page }) => {
  await login(page);
  await page.goto(ADMIN + "/items/900000002/details");
  const png =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aT1sAAAAASUVORK5CYII=";
  const transfer = await page.evaluateHandle((base64) => {
    const data = new DataTransfer();
    data.items.add(
      new File(
        [Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))],
        "cover.png",
        { type: "image/png" },
      ),
    );
    return data;
  }, png);
  const upload = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/items/900000002/cover") &&
      response.request().method() === "POST",
  );
  await page
    .locator(".cover-drop-zone")
    .dispatchEvent("drop", { dataTransfer: transfer });
  expect((await upload).ok()).toBe(true);
  await transfer.dispose();
  await page.reload();
  const cover = page.locator("gsl-item-edit-cover img");
  await expect(cover).toBeVisible();
  await expect.poll(() => cover.evaluate((img) => img.naturalWidth)).toBe(1);
});

test("the PDF viewer renders a stored label through the real API", async ({
  page,
}) => {
  await login(page);
  const pdf = page.waitForResponse((response) =>
    response.url().includes("/api/labels_print_queue/1/pdf"),
  );
  await page.goto(ADMIN + "/admin/labels-print-queue/1/edit");
  const response = await pdf;
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/pdf");
  expect((await response.body()).toString()).toContain(
    "Browser regression label",
  );
  const canvas = page.locator("ngx-extended-pdf-viewer canvas").first();
  await expect(canvas).toBeVisible();
  // The viewer does not enable a selectable text layer by default. Wait for
  // actual dark glyphs to be painted, rather than accepting an empty canvas.
  await expect
    .poll(
      () =>
        canvas.evaluate((element) => {
          const pixels = element
            .getContext("2d")
            .getImageData(0, 0, element.width, element.height).data;
          let ink = 0;
          for (let i = 0; i < pixels.length; i += 4) {
            if (
              pixels[i + 3] > 0 &&
              pixels[i] < 100 &&
              pixels[i + 1] < 100 &&
              pixels[i + 2] < 100
            )
              ink++;
          }
          return ink;
        }),
      { timeout: 15000 },
    )
    .toBeGreaterThan(100);
});
