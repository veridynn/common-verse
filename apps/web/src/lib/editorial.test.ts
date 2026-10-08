import { describe, expect, it } from "vitest";
import { authorDisplayName } from "./editorial";

describe("public author names", () => {
  it("removes the known demo suffix from Latin and RTL names", () => {
    expect(authorDisplayName("Mazlum Koç [bulk-demo-v1-60]")).toBe(
      "Mazlum Koç",
    );
    expect(authorDisplayName("الصفار عز الدين [bulk-demo-v1-58]")).toBe(
      "الصفار عز الدين",
    );
  });
  it("preserves ordinary names and unrelated bracketed text", () => {
    for (const name of [
      "Jonathan Green",
      "Poet [pen name]",
      "[bulk-demo-v1-58] Poet",
    ])
      expect(authorDisplayName(name)).toBe(name);
  });
});
