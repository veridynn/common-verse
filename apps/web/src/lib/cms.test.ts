import { afterEach, describe, expect, it, vi } from "vitest";
import { getActivePoets, getRecentPoems, getUpcomingWorkshops } from "./cms";

afterEach(() => vi.unstubAllGlobals());

describe("automatic homepage queries", () => {
  it("queries latest published poems and nearest localized events at the database", async () => {
    const fetch = vi
      .fn()
      .mockImplementation(async () => Response.json({ docs: [] }));
    vi.stubGlobal("fetch", fetch);
    await getRecentPoems("ar");
    const poems = new URL(fetch.mock.calls[0][0]);
    expect(poems.searchParams.get("sort")).toBe("-createdAt");
    expect(poems.searchParams.get("where[_status][equals]")).toBe("published");
    expect(poems.searchParams.get("limit")).toBe("4");
    expect(poems.searchParams.get("fallback-locale")).toBe("none");
    await getUpcomingWorkshops("ar");
    const events = new URL(fetch.mock.calls[1][0]);
    expect(events.searchParams.get("sort")).toBe("startDate");
    expect(events.searchParams.get("where[title][exists]")).toBe("true");
    expect(
      events.searchParams.get("where[or][1][endDate][greater_than_equal]"),
    ).toBeTruthy();
  });
  it("skips inactive profiles and continues past the first page until four active poets", async () => {
    const pages: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: URL) => {
        const url = new URL(input);
        if (url.pathname === "/api/authors") {
          const page = url.searchParams.get("page")!;
          pages.push(page);
          const ids = page === "1" ? [1, 2, 3, 4] : [5, 6, 7, 8];
          return Response.json({
            docs: ids.map((id) => ({ id, name: `Poet ${id}` })),
            hasNextPage: page === "1",
          });
        }
        const id = Number(url.searchParams.get("where[author][equals]"));
        expect(url.searchParams.get("where[_status][equals]")).toBe(
          "published",
        );
        return Response.json({
          docs: id > 2 ? [{ id: 100 + id, author: { id } }] : [],
        });
      }),
    );
    const result = await getActivePoets("en");
    expect(pages).toEqual(["1", "2"]);
    expect(result.authors.map((author) => author.id)).toEqual([3, 4, 5, 6]);
    expect(result.poems).toHaveLength(4);
  });
  it("reports failed automatic requests instead of silently presenting empty content", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 503 })),
    );
    await expect(getRecentPoems("en")).rejects.toThrow("503");
    await expect(getActivePoets("en")).rejects.toThrow("503");
  });
});
