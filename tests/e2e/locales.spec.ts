import { expect, test } from "@playwright/test";

const expectations = [
  ["de", "ltr"],
  ["en", "ltr"],
  ["ar", "rtl"],
  ["fa", "rtl"],
  ["uk", "ltr"],
  ["ku", "ltr"],
] as const;

const workshopTitles = {
  de: "Poesie über Grenzen",
  en: "Poetry Across Borders",
  ar: "الشعر عبر الحدود",
  fa: "شعر فراتر از مرزها",
  uk: "Поезія без кордонів",
  ku: "Helbest li Ser Sînoran",
} as const;

for (const [locale, direction] of expectations) {
  test(`${locale} has the expected document language and direction`, async ({
    page,
  }) => {
    await page.goto(`/${locale}`);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator("html")).toHaveAttribute("dir", direction);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test(`${locale} workshop route renders localized content`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/workshops/test`);
    await expect(
      page.getByRole("heading", { level: 1, name: workshopTitles[locale] }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("dir", direction);
  });
}

test("primary navigation is keyboard accessible", async ({ page }) => {
  await page.goto("/de");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: /zum inhalt/i })).toBeFocused();
});

test("primary navigation targets render collection indexes", async ({
  page,
}) => {
  await page.goto("/en");
  await page.getByRole("link", { name: "Workshops" }).click();
  await expect(page).toHaveURL(/\/en\/workshops$/);
  await expect(
    page.getByRole("link", { name: "Poetry Across Borders" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Poems" }).click();
  await expect(page).toHaveURL(/\/en\/poems$/);
  await expect(page.getByRole("link", { name: "صبح مشترک" })).toBeVisible();
});

test("language switcher changes the locale URL and document direction", async ({
  page,
}) => {
  await page.goto("/de");
  await page.getByRole("combobox", { name: "Sprache" }).selectOption("ar");
  await expect(page).toHaveURL(/\/ar$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
});

test("localized workshop renders media, metadata, and structured data", async ({
  page,
}) => {
  await page.goto("/ar/workshops/test");
  await expect(
    page.getByRole("heading", { level: 1, name: "الشعر عبر الحدود" }),
  ).toBeVisible();
  await expect(page.getByRole("img")).toHaveAttribute("alt", /paper shapes/i);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "الشعر عبر الحدود",
  );
  await expect(page.locator('link[hreflang="ku"]')).toHaveAttribute(
    "href",
    /\/ku\/workshops\/test$/,
  );
  const structuredData = await page
    .locator('script[type="application/ld+json"]')
    .textContent();
  expect(JSON.parse(structuredData ?? "{}")["@type"]).toBe("Event");
});

test("workshop hreflang omits locales without a translation", async ({
  page,
}) => {
  await page.goto("/en/workshops/partial");
  await expect(page.locator('link[hreflang="en"]')).toHaveCount(1);
  await expect(page.locator('link[hreflang="fa"]')).toHaveCount(0);
});

test("draft preview rejects a bad secret and renders an authorized draft", async ({
  page,
}) => {
  const invalid = await page.request.get(
    "/en/workshops/test?previewSecret=wrong",
  );
  expect(invalid.status()).toBe(401);

  await page.goto("/en/workshops/test?previewSecret=test-preview");
  await expect(page.getByRole("status")).toHaveText("Draft preview");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("draft");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex,nofollow",
  );
});

test("poem keeps the Persian original visible with explicit translations", async ({
  page,
}) => {
  await page.goto("/en/poems/test-poem");
  await expect(page.locator('[lang="fa"][dir="rtl"]')).toContainText(
    "صبح از میان پنجره‌های ما",
  );
  await expect(
    page.getByRole("heading", { name: "A Shared Morning" }),
  ).toBeVisible();
  await expect(
    page.getByText("Translated by Prototype translation").first(),
  ).toBeVisible();
});

test("Arabic home has no console or page errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/ar");
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

test("preview secrets are taken from runtime for both content types", async ({
  page,
}) => {
  for (const route of ["/de/workshops/test", "/ar/poems/test-poem"]) {
    const buildSecret = await page.request.get(
      `${route}?previewSecret=build-preview`,
    );
    expect(buildSecret.status()).toBe(401);
    await page.goto(`${route}?previewSecret=test-preview`);
    await expect(page.getByRole("status")).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex,nofollow",
    );
  }
});
