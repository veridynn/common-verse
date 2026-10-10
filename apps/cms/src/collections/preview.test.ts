import { afterEach, expect, it, vi } from "vitest";
import { Homepage } from "../globals/Homepage";
import { Poems } from "./Poems";
import { Workshops } from "./Workshops";

afterEach(() => vi.unstubAllEnvs());

it.each([Homepage, Poems, Workshops])(
  "$slug preview URLs keep the editor language separate from the content locale",
  async (config) => {
    vi.stubEnv("PREVIEW_SECRET", "secret");
    const livePreview = config.admin!.livePreview!.url;
    if (typeof livePreview !== "function") throw new Error("Missing preview");
    const req = { i18n: { language: "en" } };
    const urls = [
      await config.admin!.preview!({ slug: "test" }, {
        locale: "ar",
        req,
      } as never),
      await livePreview({
        data: { slug: "test" },
        locale: { code: "ar" },
        req,
      } as never),
    ];
    for (const value of urls) {
      const url = new URL(value!);
      expect(url.pathname).toBe(
        config.slug === "homepage" ? "/ar" : `/ar/${config.slug}/test`,
      );
      expect(url.searchParams.get("editorLanguage")).toBe("en");
      expect(url.searchParams.get("previewSecret")).toBe("secret");
    }
  },
);
