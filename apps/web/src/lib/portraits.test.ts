import { describe, expect, it } from "vitest";
import { generatedPortrait, personPortrait } from "./portraits";

describe("Open Peeps profile portraits", () => {
  it("uses a stable ID seed and produces different avatars for different people", () => {
    expect(generatedPortrait(58)).toBe(generatedPortrait("58"));
    expect(generatedPortrait(58)).not.toBe(generatedPortrait(59));
    expect(generatedPortrait(58)).toMatch(/^data:image\/svg\+xml/);
  });
  it("generates a decorative fallback for absent or unpopulated pictures", () => {
    for (const image of [undefined, null, 12, "12"])
      expect(personPortrait(58, image)).toEqual({
        src: generatedPortrait(58),
        alt: "",
      });
  });
  it("preserves uploaded editorial portraits and their alternative text", () => {
    expect(
      personPortrait(58, {
        id: 12,
        url: "https://example.org/portrait.jpg",
        alt: "Poet at a reading",
      }),
    ).toEqual({
      src: "https://example.org/portrait.jpg",
      alt: "Poet at a reading",
    });
  });
  it("replaces the earlier demo photographs without altering media records", () => {
    const image = {
      id: 12,
      url: "/media/bulk-demo-v1-commons-portrait-1-example.jpg",
      alt: "Demo portrait",
    };
    expect(personPortrait(58, image)).toEqual({
      src: generatedPortrait(58),
      alt: "",
    });
    expect(image.url).toBe(
      "/media/bulk-demo-v1-commons-portrait-1-example.jpg",
    );
  });
});
