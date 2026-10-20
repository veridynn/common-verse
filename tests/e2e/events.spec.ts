import { expect, test } from "@playwright/test";

for (const locale of ["de", "ar"] as const) {
  const base = locale === "de" ? "/veranstaltungen" : "/ar/events";
  test(`${locale} events filter by type with keyboard on narrow screens`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base);
    const filters = page.locator(".event-filters");
    const links = filters.getByRole("link");
    await expect(page.locator(".content-list article")).toHaveCount(2);
    await expect(links.nth(0)).toHaveAttribute("aria-current", "page");
    await links.nth(1).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(`${base}?type=workshop`);
    await expect(page.locator(".content-list article")).toHaveCount(1);
    await expect(
      page.locator(`.content-list a[href="${base}/test"]`),
    ).toBeVisible();
    await expect(links.nth(1)).toHaveAttribute("aria-current", "page");
    await links.nth(2).click();
    await expect(page.locator(".content-list article")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 2 })).toHaveText(
      `Reading ${locale}`,
    );
    await expect(links.nth(2)).toHaveAttribute("aria-current", "page");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const kindLabel = await links.nth(2).innerText();
    await page.getByRole("heading", { level: 2 }).getByRole("link").click();
    await expect(page.locator("main article > [data-slot=eyebrow]")).toHaveText(
      kindLabel,
    );
    await page.goto(`${base}?type=unknown`);
    await expect(page.locator(".content-list article")).toHaveCount(2);
    await expect(links.nth(0)).toHaveAttribute("aria-current", "page");
    await links.nth(2).click();
    await links.nth(0).click();
    await expect(page).toHaveURL(base);
    await expect(page.locator(".content-list article")).toHaveCount(2);
  });
}

test("filters work without JavaScript and empty translations stay missing", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  const page = await context.newPage();
  await page.goto("/fa/events?type=event");
  await expect(page.locator(".content-list article")).toHaveCount(0);
  await expect(page.locator("main section > p:not([data-slot])")).toBeVisible();
  await page.locator(".event-filters a").first().click();
  await expect(page.locator(".content-list article")).toHaveCount(1);
  await context.close();
});

test("event details render rich text and only show reading prices", async ({
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
  await expect(page.locator("aside")).toContainText("€12.50");
  const event = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((scripts) =>
      scripts
        .map((script) => JSON.parse(script.textContent!))
        .find((value) => value["@type"] === "Event"),
    );
  expect(event.offers).toMatchObject({ price: 12.5, priceCurrency: "EUR" });
  await page.goto("/en/events/test");
  await expect(page.locator("aside")).not.toContainText("€");
  await expect(page.locator(".prose p")).toBeVisible();
});
