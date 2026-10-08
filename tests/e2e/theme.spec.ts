import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const locale of ["de", "ar"] as const) {
  test(`${locale} theme choices work on mobile and survive navigation`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 780 });
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto(locale === "de" ? "/" : "/ar");
    const name = locale === "de" ? "Darstellung" : "المظهر";
    const dark = locale === "de" ? "Dunkel" : "داكن";
    const light = locale === "de" ? "Hell" : "فاتح";
    const system = locale === "de" ? "System" : "النظام";
    const trigger = page.getByRole("button", { name: new RegExp(`^${name}:`) });
    await trigger.press("Enter");
    await page.getByRole("radio", { name: dark, exact: true }).check();
    await expect(trigger).toHaveAccessibleName(`${name}: ${dark}`);
    await expect(trigger).toBeFocused();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    const background = await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    await page.reload();
    await expect(trigger).toHaveAccessibleName(`${name}: ${dark}`);
    await trigger.click();
    await expect(
      page.getByRole("radio", { name: dark, exact: true }),
    ).toBeChecked();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("radio", { name: light, exact: true }).check();
    expect(
      await page
        .locator("body")
        .evaluate((el) => getComputedStyle(el).backgroundColor),
    ).not.toBe(background);
    await trigger.click();
    await page.getByRole("radio", { name: system, exact: true }).check();
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("body")).toHaveCSS(
      "background-color",
      background,
    );
    await page.emulateMedia({ colorScheme: "light" });
    await expect(page.locator("body")).not.toHaveCSS(
      "background-color",
      background,
    );
    await page.goto("/en/workshops/test");
    await expect(
      page.getByRole("button", { name: "Appearance: System" }),
    ).toBeVisible();
  });
}
