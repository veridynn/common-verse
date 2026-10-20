import { coordinates, savedLocation } from "./locations-client";
import type { Endpoint, PayloadRequest, Where } from "payload";
import { isEditor } from "../collections/access";

import type { LocationValue } from "@poetry/types";
export type { LocationValue } from "@poetry/types";

export interface SavedLocation extends LocationValue {
  id: number;
  alias?: string | null;
}

export interface LocationResults {
  saved: SavedLocation[];
  results: LocationValue[];
  unavailable: boolean;
}

export function photonLocations(data: unknown): LocationValue[] {
  if (
    !data ||
    typeof data !== "object" ||
    !("features" in data) ||
    !Array.isArray(data.features)
  )
    throw new Error("Invalid place search response");
  return data.features.flatMap((feature) => {
    const point = feature?.geometry?.coordinates;
    const props = feature?.properties;
    if (
      feature?.geometry?.type !== "Point" ||
      !Array.isArray(point) ||
      typeof point[0] !== "number" ||
      typeof point[1] !== "number" ||
      !Number.isFinite(point[0]) ||
      !Number.isFinite(point[1]) ||
      Math.abs(point[0]) > 180 ||
      Math.abs(point[1]) > 90 ||
      !props
    )
      return [];
    const text = (key: string) =>
      typeof props[key] === "string" ? props[key] : "";
    const street = [text("street") || text("name"), text("housenumber")]
      .filter(Boolean)
      .join(" ");
    const address = [
      ...new Set(
        [
          street,
          text("postcode"),
          text("district"),
          text("city"),
          text("state"),
          text("country"),
        ].filter(Boolean),
      ),
    ].join(", ");
    return [
      {
        address,
        coordinates: [point[0], point[1]],
      },
    ];
  });
}

async function photon(
  path: string,
  params: URLSearchParams,
  req: PayloadRequest,
) {
  const url = new URL(
    path,
    process.env.PLACE_SEARCH_URL || "https://photon.komoot.io/",
  );
  url.search = params.toString();
  const response = await fetch(url, {
    signal: AbortSignal.any([
      AbortSignal.timeout(10000),
      ...(req.signal ? [req.signal] : []),
    ]),
    headers: {
      "User-Agent": "PoetryProjectCMS/1.0 (https://thepoetryproject.de)",
    },
  });
  if (!response.ok) throw new Error("Place search unavailable");
  return photonLocations(await response.json());
}

function language(params: URLSearchParams): Record<string, string> {
  const value = params.get("lang");
  return value === "de" || value === "en" ? { lang: value } : {};
}

export const locationSearch: Endpoint = {
  path: "/search",
  method: "get",
  handler: async (req) => {
    if (!isEditor(req))
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const params = new URL(req.url!).searchParams;
    const query = params.get("q")?.trim() ?? "";
    if (query.length > 200)
      return Response.json({ error: "Invalid search" }, { status: 400 });
    const includeSaved = params.get("includeSaved") !== "false";
    const bookmarks = includeSaved
      ? await req.payload.find({
          collection: "locations",
          where: query
            ? {
                or: ["alias", "address"].map((field) => ({
                  [field]: { contains: query },
                })),
              }
            : undefined,
          limit: 12,
          sort: "address",
          depth: 0,
          overrideAccess: false,
          req,
        })
      : { docs: [] };
    const saved = bookmarks.docs.map(savedLocation);
    let results: LocationValue[] = [];
    let unavailable = false;
    const point = coordinates(query);
    if (point && params.get("savedOnly") !== "true")
      results = [{ ...point, address: "" }];
    else if (query.length >= 3 && params.get("savedOnly") !== "true") {
      try {
        results = await photon(
          "api/",
          new URLSearchParams({ q: query, limit: "6", ...language(params) }),
          req,
        );
      } catch {
        unavailable = true;
      }
    }
    if (results.length && includeSaved) {
      // Find bookmarks by position too, even when the provider uses a different language.
      const nearby = await req.payload.find({
        collection: "locations",
        where: {
          or: results.map<Where>((location) => ({
            coordinates: {
              near: [location.coordinates[0], location.coordinates[1], 1],
            },
          })),
        },
        limit: 12,
        depth: 0,
        overrideAccess: false,
        req,
      });
      for (const place of nearby.docs) {
        if (!saved.some((bookmark) => bookmark.id === place.id))
          saved.push(savedLocation(place));
      }
    }
    return Response.json(
      {
        saved,
        results,
        unavailable,
      } satisfies LocationResults,
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  },
};

export const locationReverse: Endpoint = {
  path: "/reverse",
  method: "get",
  handler: async (req) => {
    if (!isEditor(req))
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const params = new URL(req.url!).searchParams;
    const lat = params.get("lat");
    const lon = params.get("lon");
    if (!lat?.trim() || !lon?.trim())
      return Response.json({ error: "Invalid coordinates" }, { status: 400 });
    const latitude = Number(lat);
    const longitude = Number(lon);
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 ||
      Math.abs(longitude) > 180
    )
      return Response.json({ error: "Invalid coordinates" }, { status: 400 });
    const fallback: LocationValue = {
      coordinates: [longitude, latitude],
    };
    try {
      const places = await photon(
        "reverse",
        new URLSearchParams({ lat, lon, limit: "1", ...language(params) }),
        req,
      );
      return Response.json({
        ...fallback,
        ...places[0],
        coordinates: fallback.coordinates,
      });
    } catch {
      return Response.json({ ...fallback, unavailable: true });
    }
  },
};
