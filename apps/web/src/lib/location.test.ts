import { expect, it } from "vitest";
import { locationText } from "./location";

it("shows an address or a coordinate pair without requiring an address", () => {
  expect(locationText({ coordinates: [13.4, 52.5], address: "Berlin" })).toBe(
    "Berlin",
  );
  expect(locationText({ coordinates: [0, 0] })).toBe("0, 0");
  expect(locationText(null)).toBe("");
});
