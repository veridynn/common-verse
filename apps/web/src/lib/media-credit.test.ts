import { describe, expect, it } from "vitest";
import { mediaCredit } from "./media-credit";

describe("media credit links", () => {
  it("links imported source and license without treating text as HTML", () => {
    expect(
      mediaCredit(
        "Title — Artist — CC BY-SA 4.0\nhttps://commons.wikimedia.org/wiki/File:Photo.jpg\nhttps://creativecommons.org/licenses/by-sa/4.0",
      ),
    ).toEqual({
      text: "Title — Artist — CC BY-SA 4.0",
      source: "https://commons.wikimedia.org/wiki/File:Photo.jpg",
      license: "https://creativecommons.org/licenses/by-sa/4.0",
    });
  });
  it("retains ordinary credits and rejects unsafe links", () => {
    expect(mediaCredit("Editorial credit")).toEqual({
      text: "Editorial credit",
      source: null,
      license: null,
    });
    const unsafe =
      "Title\njavascript:alert(1)\nhttps://creativecommons.org/licenses/by-sa/4.0";
    expect(mediaCredit(unsafe)?.source).toBeNull();
    expect(mediaCredit(null)).toBeNull();
  });
});
