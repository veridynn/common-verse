import { describe, expect, it } from "vitest";
import {
  baseLocale,
  extractLocaleFromUrl,
  localizeUrl,
} from "../paraglide/runtime.js";
import { localizedPath, locales } from "@poetry/i18n";

describe("UI fallback and route language", () => {
  it("defaults missing UI messages to English while recognizing German at root", () => {
    expect(baseLocale).toBe("en");
    for (const locale of locales) {
      expect(
        extractLocaleFromUrl(
          new URL(localizedPath(locale), "https://poetry.test"),
        ),
      ).toBe(locale);
      expect(
        extractLocaleFromUrl(
          new URL(
            localizedPath(locale, "poems/original-slug"),
            "https://poetry.test",
          ),
        ),
      ).toBe(locale);
    }
  });
  it("keeps Paraglide URL resolution aligned with Astro route identities", () => {
    expect(
      localizeUrl(
        new URL("https://poetry.test/gedichte/original-slug?ref=invite#main"),
        { locale: "ar" },
      ).href,
    ).toBe("https://poetry.test/ar/poems/original-slug?ref=invite#main");
  });
});
