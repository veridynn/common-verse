import type { LocationValue } from "@poetry/types";

export function locationText(location?: LocationValue | null): string {
  return (
    location?.address ||
    (location?.coordinates
      ? `${location.coordinates[1]}, ${location.coordinates[0]}`
      : "")
  );
}
