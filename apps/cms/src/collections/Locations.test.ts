import { expect, it } from "vitest";
import { Locations } from "./Locations";
import { validCoordinates } from "../utilities/locations-client";

it("stores optional alias and address plus a required native coordinate point", () => {
  expect(Locations.slug).toBe("locations");
  expect(Locations.hooks).toBeUndefined();
  expect(
    Locations.fields.map((field) => ("name" in field ? field.name : null)),
  ).toEqual(["alias", "coordinates", "address"]);
  const point = Locations.fields[1];
  expect(point).toMatchObject({ type: "point", required: true });
  expect(point).not.toHaveProperty("virtual");
  expect(Locations.fields[0]).not.toHaveProperty("required", true);
});
it("validates coordinate pairs including zero", () => {
  expect(validCoordinates([0, 0])).toBe(true);
  expect(validCoordinates([13.4, 52.5])).toBe(true);
  for (const value of [
    null,
    [],
    [1],
    [181, 0],
    [0, 91],
    [NaN, 0],
    ["1", 0],
    [1, 2, 3],
  ])
    expect(validCoordinates(value)).toBe(false);
});
