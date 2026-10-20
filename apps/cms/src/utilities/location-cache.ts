import type { LocationValue, SavedLocation } from "./locations";
import {
  locationAddress,
  sameLocation,
  validCoordinates,
} from "./locations-client";

const day = 86400000;
export interface LocationCache {
  searches: { query: string; results: LocationValue[]; at: number }[];
  recent: { place: LocationValue; count: number; at: number }[];
}
export const emptyLocationCache: LocationCache = { searches: [], recent: [] };
const normalize = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ");
const plain = (place: LocationValue): LocationValue => ({
  coordinates: place.coordinates,
  address: place.address,
});

export function pruneLocationCache(
  cache = emptyLocationCache,
  now = Date.now(),
): LocationCache {
  return {
    searches: cache.searches
      .filter(
        (entry) =>
          now - entry.at < day &&
          entry.results.every((place) => validCoordinates(place.coordinates)),
      )
      .sort((a, b) => b.at - a.at)
      .slice(0, 100),
    recent: cache.recent
      .filter(
        (entry) =>
          now - entry.at < 90 * day &&
          validCoordinates(entry.place.coordinates),
      )
      .sort((a, b) => b.at - a.at)
      .slice(0, 50),
  };
}

export function cacheLocationSearch(
  cache: LocationCache,
  query: string,
  results: LocationValue[],
  now = Date.now(),
): LocationCache {
  const key = normalize(query);
  return pruneLocationCache(
    {
      ...cache,
      searches: [
        { query: key, results: results.map(plain), at: now },
        ...cache.searches.filter((entry) => entry.query !== key),
      ],
    },
    now,
  );
}

export function rememberLocation(
  cache: LocationCache,
  place: LocationValue,
  now = Date.now(),
): LocationCache {
  const previous = cache.recent.find((entry) =>
    sameLocation(entry.place, place),
  );
  return pruneLocationCache(
    {
      ...cache,
      recent: [
        { place: plain(place), count: (previous?.count ?? 0) + 1, at: now },
        ...cache.recent.filter((entry) => entry !== previous),
      ],
    },
    now,
  );
}

function relevance(
  place: LocationValue & { alias?: string | null },
  query: string,
) {
  if (!query) return 1;
  return Math.max(
    0,
    ...[place.alias, locationAddress(place)]
      .filter((text): text is string => Boolean(text))
      .map((text) => {
        const value = normalize(text);
        if (value === query) return 3;
        if (value.startsWith(query)) return 2;
        const words = value.split(/[^\p{L}\p{N}]+/u);
        return query
          .split(/\s+/)
          .every((part) => words.some((word) => word.startsWith(part)))
          ? 1
          : 0;
      }),
  );
}

export function cachedLocationResults(
  cache: LocationCache,
  query: string,
): LocationValue[] {
  const term = normalize(query);
  if (!term) return [];
  const current = pruneLocationCache(cache);
  const exact = current.searches.find((entry) => entry.query === term);
  return (
    exact?.results ??
    current.searches
      .flatMap((entry) => entry.results)
      .filter((place) => relevance(place, term) > 0)
  );
}

export function locationSuggestions(
  query: string,
  saved: SavedLocation[],
  recent: LocationCache["recent"],
  results: LocationValue[],
  familiar = true,
) {
  const term = normalize(query);
  const candidates: Array<{
    place: LocationValue & Partial<SavedLocation>;
    saved: boolean;
  }> = [];
  if (familiar)
    for (const place of saved) {
      if (!candidates.some((other) => sameLocation(other.place, place)))
        candidates.push({ place, saved: true });
    }
  if (familiar)
    for (const entry of recent) {
      if (!candidates.some(({ place }) => sameLocation(place, entry.place)))
        candidates.push({ place: entry.place, saved: false });
    }
  const usage = (place: LocationValue) =>
    recent.find((entry) => sameLocation(place, entry.place));
  const promoted = candidates
    .filter(({ place }) => relevance(place, term) > 0)
    .sort(
      (a, b) =>
        relevance(b.place, term) - relevance(a.place, term) ||
        Number(b.saved) - Number(a.saved) ||
        (usage(b.place)?.count ?? 0) - (usage(a.place)?.count ?? 0) ||
        (usage(b.place)?.at ?? 0) - (usage(a.place)?.at ?? 0),
    )
    .slice(0, term ? 2 : 5);
  const matches: typeof candidates = [];
  if (term)
    for (const result of results) {
      if (
        [...promoted, ...matches].some(({ place }) =>
          sameLocation(place, result),
        )
      )
        continue;
      const bookmark = familiar
        ? saved.find((place) => sameLocation(place, result))
        : undefined;
      matches.push({ place: bookmark ?? result, saved: Boolean(bookmark) });
      if (matches.length === 6) break;
    }
  return [...promoted, ...matches].map(({ place, saved }, index) => ({
    value: `location-${index}`,
    label: place.alias || locationAddress(place),
    place,
    saved,
  }));
}

// Storage failure must never prevent searching or choosing a location.
export async function locationCache(
  scope: string,
  update?: (cache: LocationCache) => LocationCache,
): Promise<LocationCache | null> {
  try {
    return await new Promise((resolve, reject) => {
      const request = indexedDB.open("poetry-location-cache", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("users");
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error("Location cache blocked"));
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(
          "users",
          update ? "readwrite" : "readonly",
        );
        const store = transaction.objectStore("users");
        const read = store.get(scope);
        let result: LocationCache;
        read.onsuccess = () => {
          try {
            result = pruneLocationCache(read.result);
            if (update) {
              result = update(result);
              store.put(result, scope);
            }
          } catch {
            transaction.abort();
          }
        };
        transaction.oncomplete = () => {
          db.close();
          resolve(result);
        };
        transaction.onabort = transaction.onerror = () => {
          db.close();
          reject(transaction.error);
        };
      };
    });
  } catch {
    return null;
  }
}
