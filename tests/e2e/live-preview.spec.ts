import { expect, test } from "@playwright/test";

for (const locale of ["en", "ar"]) {
  for (const path of [
    `/${locale}`,
    `/${locale}/workshops/live-preview`,
    `/${locale}/poems/test-poem`,
  ]) {
    test(`${path} draft preview refreshes after a CMS save`, async ({
      page,
    }) => {
      const cmsURL = `http://127.0.0.1:${process.env.PLAYWRIGHT_CMS_PORT ?? "3001"}`;
      await page.goto(
        `${cmsURL}/preview-host?path=${encodeURIComponent(path)}`,
      );
      await expect(page.locator("body")).toHaveAttribute("data-ready", "true");
      const frame = page
        .frames()
        .find((entry) => entry.url().includes("previewSecret="))!;
      await expect(frame.locator("html")).toHaveAttribute(
        "dir",
        locale === "ar" ? "rtl" : "ltr",
      );
      await expect(frame.getByRole("heading", { level: 1 })).toBeVisible();
      if (path.includes("workshops")) {
        await page.request.post(`${cmsURL}/preview-update?locale=${locale}`);
      }
      const refreshed = frame.waitForNavigation();
      await page.locator("iframe").evaluate((iframe: HTMLIFrameElement) => {
        iframe.contentWindow?.postMessage(
          { type: "payload-document-event" },
          "*",
        );
      });
      const response = await refreshed;
      expect(response?.headers()["cache-control"]).toBe("no-store");
      expect(response?.headers()["referrer-policy"]).toBe("no-referrer");
      if (path.includes("workshops")) {
        await expect(frame.getByRole("heading", { level: 1 })).toHaveText(
          "Updated workshop draft",
        );
      }
    });
  }
}

test("homepage preview reflects a saved section reorder", async ({ page }) => {
  const cmsURL = `http://127.0.0.1:${process.env.PLAYWRIGHT_CMS_PORT ?? "3001"}`;
  await page.goto(`${cmsURL}/preview-host?path=/fa`);
  await expect(page.locator("body")).toHaveAttribute("data-ready", "true");
  const frame = page
    .frames()
    .find((entry) => entry.url().includes("previewSecret="))!;
  const before = await frame
    .locator(".home-section")
    .evaluateAll((sections) => sections.map((section) => section.className));
  await page.request.post(
    `${cmsURL}/preview-update?document=homepage&locale=fa`,
  );
  const refreshed = frame.waitForNavigation();
  await page.locator("iframe").evaluate((iframe: HTMLIFrameElement) => {
    iframe.contentWindow?.postMessage({ type: "payload-document-event" }, "*");
  });
  await refreshed;
  const after = await frame
    .locator(".home-section")
    .evaluateAll((sections) => sections.map((section) => section.className));
  expect(after).toEqual(before.toReversed());
  await expect(frame.locator("html")).toHaveAttribute("dir", "rtl");
});
