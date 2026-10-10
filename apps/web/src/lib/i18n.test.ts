import { describe, expect, it } from "vitest";
import {
  getLocaleMetadata,
  isLocale,
  localizedPath,
  unlocalizedPath,
} from "@poetry/i18n";

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

  it("uses unprefixed German paths and prefixes the other languages", () => {
    expect(localizedPath("en", "/workshops/test/")).toBe("/en/workshops/test");
    expect(localizedPath("de")).toBe("/");
    expect(localizedPath("de", "/workshops/test/")).toBe("/workshops/test");
    expect(localizedPath("en")).toBe("/en");
    expect(unlocalizedPath("/ar/workshops/test")).toBe("/workshops/test");
    expect(unlocalizedPath("/workshops/test")).toBe("/workshops/test");
    expect(unlocalizedPath("/en")).toBe("/");
  });
  it("maps page identities without changing record slugs", () => {
    expect(localizedPath("de", "contact")).toBe("/kontakt");
    expect(localizedPath("ar", "constructor")).toBe("/ar/constructor");
    expect(localizedPath("ar", "/kontakt?ref=invite#main")).toBe(
      "/ar/contact?ref=invite#main",
    );
    expect(localizedPath("ar", unlocalizedPath("/kontakt"))).toBe(
      "/ar/contact",
    );
    expect(localizedPath("de", "/uk/contact")).toBe("/kontakt");
    expect(localizedPath("de", "poems/original-slug")).toBe(
      "/gedichte/original-slug",
    );
    expect(localizedPath("uk", "/gedichte/original-slug")).toBe(
      "/uk/poems/original-slug",
    );
    expect(unlocalizedPath("/poeten/42")).toBe("/poets/42");
  });
});
