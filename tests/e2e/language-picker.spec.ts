import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("German is served at root with canonical metadata and legacy redirects", async ({
  page,
  baseURL,
}) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(`${baseURL}/`);
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `${baseURL}/`,
  );
  await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute(
    "href",
    `${baseURL}/`,
  );
  const legacy = await page.request.get("/de/workshops/test?ref=legacy", {
    maxRedirects: 0,
  });
  expect(legacy.status()).toBe(308);
  expect(new URL(legacy.headers().location, baseURL).pathname).toBe(
    "/workshops/test",
  );
  expect(legacy.headers().location).toContain("?ref=legacy");
  await page.goto("/workshops/test");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Poesie über Grenzen",
  );
});

for (const locale of ["de", "ar"] as const) {
  test(`${locale} picker works at 320px with keyboard, focus return, and readable language names`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 780 });
    await page.goto(locale === "de" ? "/" : "/ar");
    const trigger = page.getByRole("button", {
      name: locale === "de" ? "Sprache: Deutsch" : /العربية$/,
    });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const popup = page.locator('[data-slot="popover-content"]');
    await expect(popup.getByRole("link")).toHaveCount(6);
    await expect(popup.locator('[lang="fa"][dir="rtl"]')).toHaveText("فارسی");
    await expect(popup.locator('a[aria-current="page"]')).toContainText(
      locale === "de" ? "Deutsch" : "العربية",
    );
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
}

test("language links preserve the content path, query, and anchor when returning to German", async ({
  page,
}) => {
  await page.goto("/en/workshops/test?ref=invite#main");
  await page.getByRole("button", { name: "Language: English" }).click();
  await page.getByRole("link", { name: "Deutsch", exact: true }).click();
  await expect(page).toHaveURL(/\/workshops\/test\?ref=invite#main$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
});

test("language selection remains available without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/`);
  await page.locator(".language-fallback summary").click();
  await page.getByRole("link", { name: "English", exact: true }).click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await context.close();
});

test("German page names share route identity, alternates, and query/hash with other languages", async ({
  page,
  baseURL,
}) => {
  const legacy = await page.request.get("/poems/test-poem?ref=legacy", {
    maxRedirects: 0,
  });
  expect(legacy.status()).toBe(308);
  expect(legacy.headers().location).toBe("/gedichte/test-poem?ref=legacy");
  await page.goto("/gedichte/test-poem?ref=invite#main");
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `${baseURL}/gedichte/test-poem`,
  );
  await expect(page.locator('link[hreflang="ar"]')).toHaveAttribute(
    "href",
    `${baseURL}/ar/poems/test-poem`,
  );
  await page.getByRole("button", { name: "Sprache: Deutsch" }).click();
  await page.getByRole("link", { name: "العربية", exact: true }).click();
  await expect(page).toHaveURL(/\/ar\/poems\/test-poem\?ref=invite#main$/);
  await page.getByRole("button", { name: /العربية$/ }).click();
  await page.getByRole("link", { name: "Deutsch", exact: true }).click();
  await expect(page).toHaveURL(/\/gedichte\/test-poem\?ref=invite#main$/);
});
