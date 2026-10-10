import { expect, test } from "@playwright/test";

for (const locale of ["en", "ar"]) {
  test(`${locale} spacing scales smoothly and stops at its viewport limits`, async ({
    page,
  }, testInfo) => {
    await page.goto(`/${locale}`);
    for (const [width, gutter, panel] of [
      [320, 16, 24],
      [400, 16, 24],
      [840, 22.25, 40.5],
      [1280, 28.5, 57],
      [1600, 28.5, 57],
    ]) {
      await page.setViewportSize({ width, height: 900 });
      const spacing = await page.locator(".homepage").evaluate((element) => ({
        start: parseFloat(getComputedStyle(element).paddingInlineStart),
        end: parseFloat(getComputedStyle(element).paddingInlineEnd),
        overflow: document.documentElement.scrollWidth > window.innerWidth,
      }));
      expect(spacing.start).toBeCloseTo(gutter, 1);
      expect(spacing.end).toBeCloseTo(gutter, 1);
      expect(spacing.overflow).toBe(false);
      const panelPadding = await page
        .locator(".section-introduction")
        .evaluate((element) =>
          parseFloat(getComputedStyle(element).paddingInlineStart),
        );
      expect(panelPadding).toBeCloseTo(panel, 1);
      if (width === 320 || width === 1280) {
        await page.screenshot({
          path: testInfo.outputPath(`${width}.png`),
          fullPage: true,
        });
      }
    }
    await page.goto(`/${locale}/events/test`);
    const cardPadding = await page
      .locator('[data-slot="card-content"]')
      .evaluate((element) =>
        parseFloat(getComputedStyle(element).paddingInlineStart),
      );
    expect(cardPadding).toBeCloseTo(19, 1);
  });
}
