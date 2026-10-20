import type { LocationValue } from "@poetry/types";
import type { SavedLocation } from "./locations";

export function validCoordinates(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every(
      (number) => typeof number === "number" && Number.isFinite(number),
    ) &&
    Math.abs(value[0]) <= 180 &&
    Math.abs(value[1]) <= 90
  );
}
export function coordinates(value: string): LocationValue | null {
  const match = value
    .trim()
    .match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const point: [number, number] = [Number(match[2]), Number(match[1])];
  return validCoordinates(point) ? { coordinates: point } : null;
}
export function sameLocation(a: LocationValue, b: LocationValue) {
  return a.coordinates.every(
    (number, index) => Math.abs(number - b.coordinates[index]) < 0.00001,
  );
}
export function locationAddress(location: LocationValue) {
  return (
    location.address || `${location.coordinates[1]}, ${location.coordinates[0]}`
  );
}
export function savedLocation(doc: {
  id: number;
  alias?: string | null;
  coordinates: [number, number];
  address?: string | null;
}): SavedLocation {
  return {
    id: doc.id,
    alias: doc.alias,
    coordinates: doc.coordinates,
    address: doc.address,
  };
}
