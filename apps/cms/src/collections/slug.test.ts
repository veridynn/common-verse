import { describe, expect, it } from "vitest";
import { validPublicSlug } from "./slug";
import { message } from "@poetry/cms-ui";

const options = {
  required: true,
  req: {
    payload: { config: {} },
    t: () => "Required",
    i18n: { language: "ar" },
  },
} as unknown as Parameters<typeof validPublicSlug>[1];
describe("public record slugs", () => {
  it("requires ASCII URL segments while preserving original titles and unchanged legacy URLs", async () => {
    expect(await validPublicSlug("original-title_42", options)).toBe(true);
    expect(await validPublicSlug("عنوان", options)).toBe(
      message("slug_format", "ar"),
    );
    expect(await validPublicSlug("%D8%B9", options)).not.toBe(true);
    expect(await validPublicSlug("../contact", options)).not.toBe(true);
    expect(
      await validPublicSlug("عنوان", { ...options, previousValue: "عنوان" }),
    ).toBe(true);
    expect(await validPublicSlug("", options)).toBe("Required");
  });
});
