import { expect, test } from "@playwright/test";

for (const locale of ["de", "ar"] as const) {
  const base = locale === "de" ? "/veranstaltungen" : "/ar/events";
  test(`${locale} events open with keyboard on narrow screens`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto(base);
    await expect(page.locator(".content-list article")).toHaveCount(2);
    const link = page.locator(`.content-list a[href="${base}/test"]`);
    await link.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(`${base}/test`);
    await expect(page.locator("aside time")).toHaveCount(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test("events work without JavaScript and missing translations stay omitted", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  const page = await context.newPage();
  await page.goto("/fa/events");
  await expect(page.locator(".content-list article")).toHaveCount(1);
  await expect(page.locator('a[href="/fa/events/reading"]')).toHaveCount(0);
  await page.locator(".content-list a").click();
  await expect(page.locator("aside time")).toHaveCount(1);
  await context.close();
});

test("event details render the current fields and rich text", async ({
  page,
}) => {
  await page.goto("/en/events/reading");
  await expect(page.locator(".prose strong")).toBeVisible();
  const inlineImage = page.locator(".event-content-image img");
  await inlineImage.scrollIntoViewIfNeeded();
  await expect(inlineImage).toHaveAttribute(
    "alt",
    "Layered colourful paper shapes",
  );
  await expect(inlineImage).toHaveAttribute(
    "src",
    /\/api\/media\/file\/inline.svg$/,
  );
  await expect
    .poll(() =>
      inlineImage.evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0);
  await expect(page.locator(".event-content-image figcaption")).toHaveText(
    "The Poetry Project",
  );
  await expect(page.locator("aside")).toContainText(
    "The Poetry Project, Berlin",
  );
  await expect(page.locator("aside time")).toHaveCount(1);
  await expect(page.locator(".image-credit")).toHaveText("Event photographer");
  await expect(
    page.getByRole("link", { name: "Register", exact: true }),
  ).toHaveAttribute("href", "https://example.org/register");
  await expect(page.locator(".back-link")).toHaveAttribute(
    "href",
    "/en/events",
  );
  const event = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((scripts) =>
      scripts
        .map((script) => JSON.parse(script.textContent!))
        .find((value) => value["@type"] === "Event"),
    );
  expect(event).not.toHaveProperty("offers");
  expect(event).not.toHaveProperty("endDate");
  await page.goto("/en/events/test");
  await expect(page.locator("aside")).not.toContainText("€");
  await expect(page.locator(".prose p")).toBeVisible();
});

test("unsafe registration links are omitted", async ({ page }) => {
  await page.goto("/en/events/unsafe-registration");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Register", exact: true }),
  ).toHaveCount(0);
});

for (const locale of ["de", "ar"]) {
  test(`${locale} event layout reflows with readable details`, async ({
    page,
  }, testInfo) => {
    await page.goto(
      locale === "de" ? "/veranstaltungen/reading" : "/ar/events/reading",
    );
    for (const width of [320, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.locator("aside")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: testInfo.outputPath(`event-${width}.png`),
        fullPage: true,
      });
    }
    await page.locator(".back-link").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".event-programme img")).toHaveCount(2);
  });
}
