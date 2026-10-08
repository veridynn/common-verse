import { describe, expect, it } from "vitest";
import type { Workshop } from "@poetry/types";
import {
  contentDirection,
  poemExcerpt,
  safeHref,
  upcomingEvents,
} from "./homepage";

const event = (
  id: number,
  startDate: string,
  extra: Partial<Workshop> = {},
): Workshop => ({
  id,
  startDate,
  title: `Event ${id}`,
  slug: `event-${id}`,
  _status: "published",
  ...extra,
});
describe("homepage editorial behaviour", () => {
  it("prioritises pins, excludes past and unpublished events, and removes duplicates", () => {
    const now = new Date("2026-10-08T12:00:00Z");
    const first = event(1, "2026-10-09T12:00:00Z");
    const pinned = event(2, "2026-10-10T12:00:00Z");
    const ongoing = event(3, "2026-10-07T12:00:00Z", {
      endDate: "2026-10-09T12:00:00Z",
    });
    const past = event(4, "2026-10-01T12:00:00Z");
    const draft = event(5, "2026-10-11T12:00:00Z", { _status: "draft" });
    expect(
      upcomingEvents(
        [first, pinned, ongoing, past, draft],
        [past, pinned],
        3,
        now,
      ).map((entry) => entry.id),
    ).toEqual([2, 3, 1]);
    expect(
      upcomingEvents(
        [event(6, "invalid"), event(7, "2026-10-09", { title: "" })],
        [],
        3,
        now,
      ),
    ).toEqual([]);
  });
  it("preserves the original and does not invent a translation", () => {
    const poem = {
      id: 1,
      slug: "a",
      title: "A",
      originalLanguage: "fa" as const,
      originalText: "one\ntwo\nthree\nfour\nfive\nsix",
      translations: [],
    };
    expect(poemExcerpt(poem, "ar")).toEqual({
      original: "one\ntwo\nthree\nfour\nfive",
      translation: undefined,
    });
    expect(contentDirection("fa")).toBe("rtl");
    expect(contentDirection("ku")).toBe("ltr");
  });
  it("localises internal links and rejects executable or disguised URLs", () => {
    expect(safeHref("/workshops", "ar")).toBe("/ar/workshops");
    expect(safeHref("/de/poems", "ar")).toBe("/poems");
    for (const value of [
      "javascript:alert(1)",
      "//evil.test",
      "/\\evil.test",
      "data:text/html,hello",
    ])
      expect(safeHref(value, "en")).toBeUndefined();
    expect(safeHref("mailto:hello@example.org", "en")).toBe(
      "mailto:hello@example.org",
    );
  });
});
