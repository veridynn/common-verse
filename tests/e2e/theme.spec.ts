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
    // Wait for the closing popover to unmount before auditing the new theme.
    await expect(page.locator("[data-popover-content]")).toHaveCount(0);
    expect(
      await page
        .locator("body")
        .evaluate((el) => getComputedStyle(el).backgroundColor),
    ).not.toBe(background);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
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

test.describe("server-rendered Plum themes", () => {
  test.use({ javaScriptEnabled: false });

  for (const locale of ["de", "ar"] as const) {
    for (const theme of ["light", "dark"] as const) {
      test(`${locale} ${theme} renders the saved palette and readable token pairs without JavaScript`, async ({
        page,
        context,
        baseURL,
      }) => {
        await context.addCookies([
          { name: "poetry-theme", value: theme, url: baseURL! },
        ]);
        // An explicit choice must override the device preference on first render.
        await page.emulateMedia({
          colorScheme: theme === "light" ? "dark" : "light",
        });
        await page.goto(locale === "de" ? "/" : "/ar");
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await expect(page.locator("html")).toHaveAttribute(
          "dir",
          locale === "ar" ? "rtl" : "ltr",
        );
        await expect(page.locator("body")).toHaveCSS(
          "background-color",
          theme === "light" ? "rgb(252, 248, 252)" : "rgb(33, 26, 36)",
        );

        const results = await page.evaluate(() => {
          const pairs: [string, string, number][] = [
            ["foreground", "background", 4.5],
            ["card-foreground", "card", 4.5],
            ["popover-foreground", "popover", 4.5],
            ["primary-foreground", "primary", 4.5],
            ["primary-foreground", "primary-hover", 4.5],
            ["primary-text", "background", 4.5],
            ["primary-text", "card", 4.5],
            ["secondary-foreground", "secondary", 4.5],
            ["muted-foreground", "background", 4.5],
            ["muted-foreground", "card", 4.5],
            ["muted-foreground", "muted", 4.5],
            ["accent-foreground", "accent", 4.5],
            ["header-foreground", "header-background", 4.5],
            ["header-foreground", "header-control-background", 4.5],
            ["header-foreground", "header-control-hover", 4.5],
            ["newsletter-foreground", "newsletter-background", 4.5],
            ["input", "background", 3],
            ["input", "card", 3],
            ["header-control-border", "header-control-background", 3],
            ["header-control-border", "header-control-hover", 3],
            ["ring", "background", 3],
            ["ring", "card", 3],
            ["ring", "header-background", 3],
          ];
          for (const status of ["success", "warning", "error", "info"]) {
            pairs.push([`${status}-foreground`, status, 4.5]);
            pairs.push([status, `${status}-subtle`, 4.5]);
          }
          const probe = document.createElement("span");
          document.body.append(probe);
          const luminance = (color: string) => {
            const channels = color
              .match(/[\d.]+/g)!
              .slice(0, 3)
              .map(Number);
            const linear = channels.map((channel) => {
              const value = channel / 255;
              return value <= 0.04045
                ? value / 12.92
                : ((value + 0.055) / 1.055) ** 2.4;
            });
            return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
          };
          const results = pairs.map(([foreground, background, minimum]) => {
            probe.style.color = `var(--${foreground})`;
            probe.style.backgroundColor = `var(--${background})`;
            const style = getComputedStyle(probe);
            const a = luminance(style.color);
            const b = luminance(style.backgroundColor);
            return {
              pair: `${foreground} on ${background}`,
              ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
              minimum,
            };
          });
          probe.remove();
          return results;
        });
        for (const result of results) {
          expect(result.ratio, result.pair).toBeGreaterThanOrEqual(
            result.minimum,
          );
        }
        // axe injects scripts into frames; the interactive tests audit the DOM.
        // This context specifically checks CSS and SSR with scripting disabled.
        await page.screenshot({
          path: `/tmp/poetry-plum-${locale}-${theme}.png`,
          fullPage: true,
        });
      });
    }
  }
});
