import { afterEach, describe, expect, it, vi } from "vitest";
import { coordinates, sameLocation } from "./locations-client";
import { photonLocations, locationSearch, locationReverse } from "./locations";

const saved = {
  id: 9,
  alias: "Workshop space",
  address: "Street 1, Berlin",
  coordinates: [13.4, 52.5] as [number, number],
};
const savedDocument = saved;
const req = (
  query: string,
  user: unknown = { collection: "users", role: "editor" },
) => ({
  user,
  url: `http://localhost/api/locations/search?q=${encodeURIComponent(query)}&lang=de`,
  payload: { find: vi.fn().mockResolvedValue({ docs: [savedDocument] }) },
});
const feature = {
  geometry: { type: "Point", coordinates: [13.4, 52.5] },
  properties: {
    name: "Library",
    street: "Street",
    housenumber: "1",
    city: "Berlin",
  },
};
afterEach(() => vi.unstubAllGlobals());

describe("location search and bookmarks", () => {
  it("accepts coordinate pairs, including zero, and rejects invalid ranges", () => {
    expect(coordinates("52.52, 13.405")).toEqual({
      coordinates: [13.405, 52.52],
    });
    expect(coordinates("0, 0")).toEqual({ coordinates: [0, 0] });
    for (const value of ["91, 0", "0, -181", "Berlin", "NaN, 0", "1,2,3"])
      expect(coordinates(value)).toBeNull();
    expect(sameLocation(saved, { coordinates: [13.4, 52.5000001] })).toBe(true);
    expect(sameLocation(saved, { coordinates: [13.4, 52.51] })).toBe(false);
  });
  it("returns full addresses without a separate place name", () => {
    expect(
      photonLocations({
        features: [
          {
            ...feature,
            properties: {
              ...feature.properties,
              postcode: "10115",
              country: "Germany",
            },
          },
        ],
      }),
    ).toEqual([
      {
        address: "Street 1, 10115, Berlin, Germany",
        coordinates: [13.4, 52.5],
      },
    ]);
    expect(
      photonLocations({
        features: [{ geometry: { type: "Point", coordinates: [200, 91] } }],
      }),
    ).toEqual([]);
    expect(() => photonLocations({})).toThrow();
  });
  it("includes street and city names when the geocoder has no street property", () => {
    const street = photonLocations({
      features: [
        {
          ...feature,
          properties: {
            type: "street",
            name: "John-Foster-Dulles-Allee",
            postcode: "10557",
            city: "Berlin",
            country: "Germany",
          },
        },
      ],
    });
    expect(street[0].address).toBe(
      "John-Foster-Dulles-Allee, 10557, Berlin, Germany",
    );
    expect(
      photonLocations({
        features: [
          {
            ...feature,
            properties: { name: "Berlin", city: "Berlin", country: "Germany" },
          },
        ],
      })[0].address,
    ).toBe("Berlin, Germany");
  });
  it("requires editor access before querying bookmarks or external services", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    for (const user of [null, { collection: "users", role: "contributor" }]) {
      const request = req("Berlin", user);
      expect((await locationSearch.handler!(request as never)).status).toBe(
        401,
      );
      expect((await locationReverse.handler!(request as never)).status).toBe(
        401,
      );
      expect(request.payload.find).not.toHaveBeenCalled();
    }
    expect(fetch).not.toHaveBeenCalled();
  });
  it("returns saved locations when empty and searches aliases and addresses", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const initial = req("");
    expect(
      await (await locationSearch.handler!(initial as never)).json(),
    ).toMatchObject({ saved: [saved], results: [] });
    expect(fetch).not.toHaveBeenCalled();
    const request = req("Wo");
    await locationSearch.handler!(request as never);
    expect(request.payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "locations",
        sort: "address",
        overrideAccess: false,
        req: request,
        where: {
          or: ["alias", "address"].map((key) => ({
            [key]: { contains: "Wo" },
          })),
        },
      }),
    );
    expect(fetch).not.toHaveBeenCalled();
  });
  it("can return saved matches immediately without waiting for external search", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const request = req("Workshop");
    request.url += "&savedOnly=true";
    expect(
      await (await locationSearch.handler!(request as never)).json(),
    ).toEqual({ saved: [saved], results: [], unavailable: false });
    expect(fetch).not.toHaveBeenCalled();
  });
  it("searches addresses without bookmark queries when explicitly requested", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ features: [feature] }),
      }),
    );
    const request = req("Street");
    request.url += "&includeSaved=false";
    expect(
      await (await locationSearch.handler!(request as never)).json(),
    ).toEqual({
      saved: [],
      results: [{ address: "Street 1, Berlin", coordinates: [13.4, 52.5] }],
      unavailable: false,
    });
    expect(request.payload.find).not.toHaveBeenCalled();
  });
  it("keeps bookmarks usable on failure and preserves provider results for UI ranking", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ features: [feature] }),
      });
    vi.stubGlobal("fetch", fetch);
    expect(
      await (await locationSearch.handler!(req("Workshop") as never)).json(),
    ).toEqual({ saved: [saved], results: [], unavailable: true });
    expect(
      await (await locationSearch.handler!(req("Library") as never)).json(),
    ).toEqual({
      saved: [saved],
      results: [{ address: "Street 1, Berlin", coordinates: [13.4, 52.5] }],
      unavailable: false,
    });
    const url = fetch.mock.calls[1][0] as URL;
    expect(url.searchParams.get("limit")).toBe("6");
    expect(url.searchParams.get("lang")).toBe("de");
  });
  it("recognizes a saved point when the provider uses another place name", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ features: [feature] }),
      }),
    );
    const request = req("Bibliothek");
    request.payload.find
      .mockResolvedValueOnce({ docs: [] })
      .mockResolvedValueOnce({ docs: [savedDocument] });
    expect(
      await (await locationSearch.handler!(request as never)).json(),
    ).toEqual({
      saved: [saved],
      results: [{ address: "Street 1, Berlin", coordinates: [13.4, 52.5] }],
      unavailable: false,
    });
    expect(request.payload.find).toHaveBeenLastCalledWith(
      expect.objectContaining({
        overrideAccess: false,
        req: request,
        where: expect.objectContaining({ or: expect.any(Array) }),
      }),
    );
  });
  it("resolves coordinates without an external search and bounds requests", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    expect(
      await (await locationSearch.handler!(req("0, 0") as never)).json(),
    ).toMatchObject({
      results: [{ coordinates: [0, 0] }],
    });
    expect(
      (await locationSearch.handler!(req("a".repeat(201)) as never)).status,
    ).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("map address lookup", () => {
  const reverseReq = (lat: string, lon: string) => ({
    ...req(""),
    url: `http://localhost/api/locations/reverse?lat=${lat}&lon=${lon}`,
  });
  it("fills the address while preserving the exact clicked coordinates", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ features: [feature] }),
      }),
    );
    const response = await locationReverse.handler!(
      reverseReq("52.50005", "13.40005") as never,
    );
    expect(await response.json()).toEqual({
      address: "Street 1, Berlin",
      coordinates: [13.40005, 52.50005],
    });
  });
  it("retains the chosen point on empty results or provider failure", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ features: [] }) })
      .mockRejectedValueOnce(new Error("Unavailable"));
    vi.stubGlobal("fetch", fetch);
    expect(
      await (
        await locationReverse.handler!(reverseReq("0", "0") as never)
      ).json(),
    ).toEqual({ coordinates: [0, 0] });
    expect(
      await (
        await locationReverse.handler!(reverseReq("0", "0") as never)
      ).json(),
    ).toMatchObject({ coordinates: [0, 0], unavailable: true });
  });
  it("rejects invalid coordinates before calling the provider", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    for (const [lat, lon] of [
      ["", "0"],
      ["91", "0"],
      ["0", "181"],
      ["NaN", "0"],
    ])
      expect(
        (await locationReverse.handler!(reverseReq(lat, lon) as never)).status,
      ).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
});
