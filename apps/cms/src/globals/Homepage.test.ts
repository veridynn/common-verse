import { afterEach, describe, expect, it, vi } from "vitest";
import {
  Homepage,
  homepagePreviewUrl,
  publishedContent,
  validLink,
} from "./Homepage";
import { authenticated } from "../collections/access";

afterEach(() => vi.unstubAllEnvs());
describe("homepage publishing and preview", () => {
  it("keeps the editor and history authenticated and strips populated draft relationships", () => {
    expect(Homepage.access?.update).toBe(authenticated);
    expect(Homepage.access?.readVersions).toBe(authenticated);
    expect(
      publishedContent({
        _status: "published",
        feature: { poem: { title: "Secret", _status: "draft" } },
        events: [
          { _status: "published", title: "Public" },
          { _status: "draft", title: "Private" },
        ],
      }),
    ).toEqual({
      _status: "published",
      feature: { poem: null },
      events: [{ _status: "published", title: "Public" }],
    });
  });
  it("rejects draft reads before touching the database", async () => {
    vi.stubEnv("PREVIEW_SECRET", "secret");
    const findGlobal = vi.fn();
    const endpoint = Array.isArray(Homepage.endpoints)
      ? Homepage.endpoints.find((entry) => entry.path === "/preview")
      : undefined;
    const response = await endpoint!.handler!({
      headers: new Headers(),
      payload: { findGlobal },
    } as never);
    expect(response.status).toBe(401);
    expect(findGlobal).not.toHaveBeenCalled();
  });
  it("reads the saved draft only after authorization and validates the locale", async () => {
    vi.stubEnv("PREVIEW_SECRET", "secret");
    const findGlobal = vi.fn().mockResolvedValue({ _status: "draft" });
    const endpoint = Array.isArray(Homepage.endpoints)
      ? Homepage.endpoints.find((entry) => entry.path === "/preview")
      : undefined;
    const response = await endpoint!.handler!({
      url: "http://cms/api/globals/homepage/preview?locale=ar",
      headers: new Headers({ "x-preview-secret": "secret" }),
      payload: { findGlobal },
    } as never);
    expect(response.status).toBe(200);
    expect(findGlobal).toHaveBeenCalledWith(
      expect.objectContaining({
        locale: "ar",
        draft: true,
        fallbackLocale: false,
        overrideAccess: true,
      }),
    );
    expect(response.headers.get("cache-control")).toBe("no-store");
    const invalid = await endpoint!.handler!({
      url: "http://cms/api/globals/homepage/preview?locale=unknown",
      headers: new Headers({ "x-preview-secret": "secret" }),
    } as never);
    expect(invalid.status).toBe(400);
  });
  it("does not publish a draft-only homepage through the public endpoint", async () => {
    const endpoint = Array.isArray(Homepage.endpoints)
      ? Homepage.endpoints.find((entry) => entry.path === "/public")
      : undefined;
    const findGlobal = vi
      .fn()
      .mockResolvedValue({ _status: "draft", feature: { heading: "Private" } });
    const response = await endpoint!.handler!({
      url: "http://cms/api/globals/homepage/public?locale=en",
      payload: { findGlobal },
    } as never);
    expect(await response.json()).toBeNull();
    expect(findGlobal).toHaveBeenCalledWith(
      expect.objectContaining({ draft: false }),
    );
  });
  it("has no preview URL without configuration and rejects unsafe link protocols", () => {
    vi.stubEnv("PREVIEW_SECRET", "");
    expect(homepagePreviewUrl("ar")).toBeNull();
    vi.stubEnv("PREVIEW_SECRET", "secret");
    expect(homepagePreviewUrl("ar")).toContain("/ar?previewSecret=secret");
    expect(new URL(homepagePreviewUrl("de")!).pathname).toBe("/");
    expect(validLink("javascript:alert(1)")).not.toBe(true);
    expect(validLink("/workshops")).toBe(true);
  });
});

describe("homepage sections", () => {
  it("offers all section variants with four-item limits and preserves legacy selections", () => {
    const field = Homepage.fields.find(
      (field) => "name" in field && field.name === "sections",
    );
    if (field?.type !== "blocks") throw new Error("Missing sections");
    expect(field.blocks.map((block) => block.slug)).toEqual(
      expect.arrayContaining([
        "featured",
        "introduction",
        "events",
        "poems",
        "poets",
        "newsletter",
      ]),
    );
    for (const slug of ["events", "poems", "poets"]) {
      const block = field.blocks.find((block) => block.slug === slug)!;
      const relationship = block.fields.find(
        (field) => field.type === "relationship",
      );
      expect(relationship).toMatchObject({ hasMany: true, maxRows: 4 });
      const mode = block.fields.find(
        (field) => "name" in field && field.name === "selectionMode",
      )!;
      if (mode.type !== "select") throw new Error("Missing mode");
      const read = mode.hooks!.afterRead![0];
      expect(
        read({ value: undefined, siblingData: { poets: [3] } } as never),
      ).toBe("manual");
      expect(read({ value: undefined, siblingData: {} } as never)).toBe("auto");
      expect(
        read({ value: "auto", siblingData: { poets: [3] } } as never),
      ).toBe("auto");
    }
  });
});
