import { describe, expect, it, vi } from "vitest";
import { eventSlug, prepareEvent, validEventPrice } from "./eventFields";
import { number } from "payload/shared";

function request() {
  return {
    user: { id: 1 },
    payload: {
      find: vi.fn().mockResolvedValue({ docs: [] }),
      findDistinct: vi.fn().mockResolvedValue({
        values: [
          { location: { coordinates: [13.4, 52.5], address: "Berlin" } },
          { location: null },
        ],
      }),
    },
  };
}

describe("event editing", () => {
  it("generates unique ASCII slugs and provides a fallback for other scripts", async () => {
    const req = request();
    req.payload.find
      .mockResolvedValueOnce({ docs: [{ id: 2 }] })
      .mockResolvedValueOnce({ docs: [{ id: 3 }] });
    expect(
      await eventSlug({
        valueToSlugify: "  Café Poetry!  ",
        data: {},
        req: req as never,
      }),
    ).toBe("cafe-poetry-3");
    expect(
      await eventSlug({ valueToSlugify: "شعر", data: {}, req: req as never }),
    ).toBe("event");
    expect(req.payload.find).toHaveBeenCalledWith(
      expect.objectContaining({ overrideAccess: false, draft: true, req }),
    );
  });

  it("preserves saved and manually entered URLs and clears workshop prices on partial updates", async () => {
    const req = request();
    const run = (
      data: Record<string, unknown>,
      originalDoc?: Record<string, unknown>,
    ) => prepareEvent({ data, originalDoc, req } as never);
    expect(
      await run({ title: "New reading", kind: "event", price: 12.5 }),
    ).toMatchObject({ slug: "new-reading", price: 12.5 });
    expect(
      await run({ title: "Changed" }, { slug: "saved", kind: "event" }),
    ).not.toHaveProperty("slug");
    expect(
      await run({ title: "Title", slug: "manual", kind: "event", price: 0 }),
    ).toMatchObject({ slug: "manual", price: 0 });
    expect(await run({ price: 10 }, { kind: "workshop" })).toMatchObject({
      price: null,
    });
    expect(
      await run({ kind: "workshop" }, { kind: "event", price: 10 }),
    ).toMatchObject({ price: null });
  });

  it("validates nonnegative prices", async () => {
    const options = {
      req: { payload: { config: {} }, t: (key: string) => key },
      required: true,
    };
    expect(await number(-1, { ...options, min: 0 } as never)).not.toBe(true);
    for (const value of [0, 12.5])
      expect(await number(value, { ...options, min: 0 } as never)).toBe(true);
  });

  it("rejects fractional cents and nonfinite prices", async () => {
    const options = {
      min: 0,
      req: { t: (key: string) => key, i18n: { language: "en" } },
    };
    for (const price of [0, 0.29, 12.5, null])
      expect(await validEventPrice(price, options as never)).toBe(true);
    for (const price of [-1, 1.001, Infinity, NaN])
      expect(await validEventPrice(price, options as never)).not.toBe(true);
  });
});
