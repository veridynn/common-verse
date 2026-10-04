import { describe, expect, it } from "vitest";
import { getLocaleMetadata, isLocale, localizedPath } from "@poetry/i18n";

describe("locale metadata", () => {
  it("marks Arabic and Persian as RTL", () => {
    expect(getLocaleMetadata("ar").direction).toBe("rtl");
    expect(getLocaleMetadata("fa").direction).toBe("rtl");
  });

  it("keeps Kurmanji LTR", () => {
    expect(getLocaleMetadata("ku").direction).toBe("ltr");
  });

  it("only accepts configured locales", () => {
    expect(isLocale("uk")).toBe(true);
    expect(isLocale("ckb")).toBe(false);
  });

  it("creates locale-prefixed paths", () => {
    expect(localizedPath("en", "/workshops/test/")).toBe("/en/workshops/test");
  });
});
