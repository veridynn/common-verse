import { expect, test } from "@playwright/test";

for (const locale of ["de", "en", "ar"] as const) {
  const base = locale === "de" ? "/artikel" : `/${locale}/articles`;
  test(`${locale} article archive and detail use localized native content`, async ({
    page,
  }) => {
    const response = await page.goto(base);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute(
      "dir",
      locale === "ar" ? "rtl" : "ltr",
    );
    await page
      .getByRole("link", { name: `Article ${locale}`, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`${base}/project-news$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      `Article ${locale}`,
    );
    await expect(page.locator(".rich-text")).toHaveText(
      `Article content ${locale}`,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(`${base}/project-news$`),
    );
    await expect(page.locator('link[hreflang="fa"]')).toHaveCount(0);
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}

test("article preview requires the runtime secret and missing translations stay missing", async ({
  page,
}) => {
  expect(
    (
      await page.goto("/en/articles/project-news?previewSecret=wrong")
    )?.status(),
  ).toBe(401);
  expect(
    (
      await page.goto("/en/articles/project-news?previewSecret=test-preview")
    )?.status(),
  ).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Article en — draft",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex,nofollow",
  );
  expect((await page.goto("/fa/articles/project-news"))?.status()).toBe(404);
  expect((await page.goto("/en/articles/missing"))?.status()).toBe(404);
});

test("old collection URLs return 404 without redirects", async ({
  request,
}) => {
  for (const path of [
    "/blog",
    "/posts",
    "/workshops",
    "/poets",
    "/poeten",
    "/de",
    "/de/articles/project-news",
    "/en/blog",
    "/en/posts",
    "/en/workshops",
    "/en/poets",
  ]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(404);
    expect(response.headers().location, path).toBeUndefined();
  }
});
