import { expect, test } from "@playwright/test";

test.use({ javaScriptEnabled: false });

for (const locale of ["de", "ar"] as const) {
  for (const width of [320, 1280]) {
    test(`${locale} ${width}px header compacts with CSS and restores at the top`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 780 });
      const header = page.locator(".site-header");
      const logo = header.locator(".brand-logo");
      for (const colorScheme of ["light", "dark"] as const) {
        await page.emulateMedia({
          colorScheme,
          reducedMotion: "no-preference",
        });
        await page.goto(locale === "de" ? "/" : "/ar");
        const initialHeight = (await header.boundingBox())!.height;
        const initialLogoWidth = (await logo.boundingBox())!.width;
        const footerLogoWidth = (await page
          .locator(".site-footer .brand-logo")
          .boundingBox())!.width;
        await page.evaluate(() => scrollTo({ top: 400, behavior: "instant" }));
        await expect
          .poll(async () => (await header.boundingBox())!.height)
          .toBeLessThan(initialHeight - 10);
        await expect
          .poll(async () => (await logo.boundingBox())!.width)
          .toBeLessThan(initialLogoWidth - 10);
        expect((await header.boundingBox())!.y).toBe(0);
        await expect(header).not.toHaveCSS(
          "background-color",
          "rgba(0, 0, 0, 0)",
        );
        expect(
          (await page.locator(".site-footer .brand-logo").boundingBox())!.width,
        ).toBe(footerLogoWidth);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
        await expect
          .poll(async () => (await header.boundingBox())!.height)
          .toBeCloseTo(initialHeight, 0);
        await page.keyboard.press("Tab");
        await page.keyboard.press("Enter");
        await expect(page.locator("#main")).toBeFocused();
        await expect
          .poll(async () => (await page.locator("#main").boundingBox())!.y)
          .toBeGreaterThanOrEqual((await header.boundingBox())!.height);
      }
    });
  }
  test(`${locale} reduced motion keeps the sticky header stable`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(locale === "de" ? "/" : "/ar");
    const header = page.locator(".site-header");
    const initial = (await header.boundingBox())!.height;
    await page.evaluate(() => scrollTo({ top: 400, behavior: "instant" }));
    await expect.poll(async () => (await header.boundingBox())!.y).toBe(0);
    expect((await header.boundingBox())!.height).toBe(initial);
  });
}
