import { afterEach, expect, it, vi } from "vitest";
import {
  cacheLocationSearch,
  cachedLocationResults,
  emptyLocationCache,
  locationCache,
  locationSuggestions,
  pruneLocationCache,
  rememberLocation,
} from "./location-cache";
import type { SavedLocation } from "./locations";

const place = (index: number, address = `Berlin Street ${index}`) => ({
  coordinates: [index, 52] as [number, number],
  address,
});
const bookmarks = (count: number): SavedLocation[] =>
  Array.from({ length: count }, (_, index) => ({
    ...place(index),
    id: index,
    alias: `Berlin ${index}`,
  }));
afterEach(() => vi.unstubAllGlobals());

it("caps empty focus at five and reserves provider results after two familiar matches", () => {
  const saved = bookmarks(20);
  const remote = Array.from({ length: 6 }, (_, index) => place(index + 30));
  expect(locationSuggestions("", saved, [], remote)).toHaveLength(5);
  const options = locationSuggestions("ber", saved, [], remote);
  expect(options).toHaveLength(8);
  expect(options.slice(0, 2).every((option) => option.saved)).toBe(true);
  expect(options.slice(2).map((option) => option.place)).toEqual(remote);
});

it("deduplicates points and marks provider bookmarks outside the promoted slots", () => {
  const saved = bookmarks(10);
  const remote = [place(0), place(1), place(9), place(30), place(30)];
  const options = locationSuggestions("ber", saved, [], remote);
  expect(options.map((option) => option.place.coordinates[0])).toEqual([
    0, 1, 9, 30,
  ]);
  expect(options[2].saved).toBe(true);
  expect(options[3].saved).toBe(false);
  expect(
    locationSuggestions("", [saved[0], { ...saved[0], id: 99 }], [], []),
  ).toHaveLength(1);
});

it("ranks text relevance before usage and never promotes weak substring matches", () => {
  let cache = emptyLocationCache;
  for (let i = 0; i < 10; i++)
    cache = rememberLocation(cache, place(1, "Berlin Road"));
  cache = rememberLocation(cache, place(2, "Berlin"));
  cache = rememberLocation(cache, place(3, "Oberlin"));
  expect(
    locationSuggestions("berlin", [], cache.recent, []).map(
      (option) => option.place.address,
    ),
  ).toEqual(["Berlin", "Berlin Road"]);
  expect(locationSuggestions("LIN", [], cache.recent, [])).toEqual([]);
});

it("uses frequency then recency for equally matching selected places", () => {
  let cache = rememberLocation(emptyLocationCache, place(1), 100);
  cache = rememberLocation(cache, place(1), 200);
  cache = rememberLocation(cache, place(2), 300);
  cache = rememberLocation(cache, place(3), 400);
  expect(
    locationSuggestions("ber", [], cache.recent, []).map(
      (option) => option.place.coordinates[0],
    ),
  ).toEqual([1, 3]);
});

it("does not promote bookmarks or history in Location creation", () => {
  const saved = bookmarks(6);
  const cache = rememberLocation(emptyLocationCache, place(20));
  expect(locationSuggestions("", saved, cache.recent, [], false)).toEqual([]);
  const options = locationSuggestions(
    "ber",
    saved,
    cache.recent,
    [place(1)],
    false,
  );
  expect(options).toHaveLength(1);
  expect(options[0].saved).toBe(false);
  expect(options[0].place).not.toHaveProperty("alias");
});

it("reuses normalized queries, supports shorter prefixes, and stores no bookmark metadata", () => {
  const cache = cacheLocationSearch(emptyLocationCache, "  BÉRLIN  ", [
    { ...place(1), id: 3, alias: "Home" } as SavedLocation,
  ]);
  expect(cachedLocationResults(cache, "berlin")).toEqual([place(1)]);
  expect(cachedLocationResults(cache, "be")).toEqual([place(1)]);
  expect(cachedLocationResults(cache, "")).toEqual([]);
  expect(cachedLocationResults(cache, "hamburg")).toEqual([]);
  expect(cache.recent).toEqual([]);
});

it("expires responses after one day and selections after 90 days and bounds both stores", () => {
  const now = Date.now();
  const cache = {
    searches: Array.from({ length: 110 }, (_, index) => ({
      query: String(index),
      results: [place(1)],
      at: now - index,
    })),
    recent: Array.from({ length: 60 }, (_, index) => ({
      place: place(index),
      count: 1,
      at: now - index,
    })),
  };
  expect(pruneLocationCache(cache).searches).toHaveLength(100);
  expect(pruneLocationCache(cache).recent).toHaveLength(50);
  expect(pruneLocationCache(cache, now + 86400000).searches).toEqual([]);
  expect(pruneLocationCache(cache, now + 90 * 86400000).recent).toEqual([]);
});

it("silently falls back when browser storage is unavailable", async () => {
  vi.stubGlobal("indexedDB", undefined);
  expect(await locationCache("user-1:de")).toBeNull();
  expect(
    await locationCache("user-1:de", (cache) =>
      rememberLocation(cache, place(1)),
    ),
  ).toBeNull();
});
