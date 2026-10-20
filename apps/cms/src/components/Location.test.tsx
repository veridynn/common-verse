import { afterEach, expect, it, vi } from "vitest";
import type { ReactElement } from "react";

const harness = vi.hoisted(() => ({
  state: 0,
  query: null as string | null,
  user: null as { id: number } | null,
  cache: null as unknown,
  loading: false,
  unavailable: false,
  effects: [] as Array<() => void | (() => void)>,
  savedResults: [] as unknown[],
  bookmark: null as unknown,
  openDrawer: vi.fn(),
  closeDrawer: vi.fn(),
  Drawer: vi.fn(),
  drawerArgs: vi.fn(),
}));
const place = {
  address: "Berlin",
  coordinates: [13.4, 52.5] as [number, number],
};
vi.mock("react", async (original) => ({
  ...(await original<typeof import("react")>()),
  useState: (initial: unknown) => {
    const index = harness.state++;
    return [
      index === 0
        ? harness.query
        : index === 1
          ? {
              saved: harness.savedResults,
              results: [],
              unavailable: harness.unavailable,
            }
          : index === 2
            ? harness.loading
            : index === 3
              ? harness.bookmark
              : index === 8 && harness.cache
                ? harness.cache
                : initial,
      vi.fn(),
    ];
  },
  useRef: (value: unknown) => ({ current: value }),
  useEffect: (effect: () => void | (() => void)) =>
    harness.effects.push(effect),
}));
vi.mock("@payloadcms/ui", () => ({
  useAuth: () => ({ user: harness.user }),
  useLocale: () => ({ code: "de" }),
  useTranslation: () => ({ i18n: { language: "en" } }),
  useDocumentDrawer: (args: unknown) => {
    harness.drawerArgs(args);
    return [
      harness.Drawer,
      vi.fn(),
      { openDrawer: harness.openDrawer, closeDrawer: harness.closeDrawer },
    ];
  },
}));
import { Location } from "./Location";

afterEach(() => {
  harness.state = 0;
  harness.query = null;
  harness.user = null;
  harness.cache = null;
  harness.loading = false;
  harness.unavailable = false;
  harness.effects = [];
  harness.savedResults = [];
  harness.bookmark = null;
  vi.unstubAllGlobals();
  vi.useRealTimers();
  vi.clearAllMocks();
});
const child = (tree: ReturnType<typeof Location>, index: number) =>
  (tree.props.children[index] as ReactElement<any>).props;

it("shows coordinates when no address is available", () => {
  const tree = Location({
    id: "location",
    value: { coordinates: [0, 0] },
    onChange: vi.fn(),
  });
  expect(child(tree, 0).text).toBe("0, 0");
});
it("omits saved suggestions and bookmark controls in Location creation", () => {
  const saved = { ...place, id: 12, alias: "Workshop" };
  harness.savedResults = [saved];
  const tree = Location({
    id: "location",
    value: null,
    bookmarks: false,
    onChange: vi.fn(),
  });
  expect(child(tree, 0).showBookmark).toBe(false);
  expect(child(tree, 0).options).toEqual([]);
  expect(tree.props.children[1]).toBe(false);
});
it("shows bookmarks on initial focus and filters them from the first character", () => {
  const home = { ...place, id: 1, alias: "Home" };
  const studio = {
    ...place,
    coordinates: [10, 53],
    address: "Hamburg",
    id: 2,
    alias: "Studio",
  };
  const point = { coordinates: [0, 0], id: 3 };
  harness.savedResults = [home, studio, point];
  const render = () => {
    harness.state = 0;
    return child(
      Location({ id: "location", value: null, onChange: vi.fn() }),
      0,
    );
  };
  expect(render().options.map((option: any) => option.place)).toEqual([
    home,
    studio,
    point,
  ]);
  harness.query = "h";
  expect(render().options.map((option: any) => option.place)).toEqual([
    home,
    studio,
  ]);
  harness.query = "HO";
  expect(render().options.map((option: any) => option.place)).toEqual([home]);
});
it("only shows local history for the current CMS user and language", () => {
  harness.user = { id: 1 };
  const data = { searches: [], recent: [{ place, count: 1, at: Date.now() }] };
  for (const scope of ["2:de", "1:en", "1:de"]) {
    harness.state = 0;
    harness.cache = { scope, data };
    const tree = Location({ id: "location", value: null, onChange: vi.fn() });
    expect(child(tree, 0).options).toHaveLength(scope === "1:de" ? 1 : 0);
  }
});
it("uses cached responses while refreshing and on provider failure, but respects fresh empty results", () => {
  harness.user = { id: 1 };
  harness.query = "ber";
  harness.cache = {
    scope: "1:de",
    data: {
      searches: [{ query: "ber", results: [place], at: Date.now() }],
      recent: [],
    },
  };
  for (const [loading, unavailable, expected] of [
    [true, false, 1],
    [false, true, 1],
    [false, false, 0],
  ] as const) {
    harness.state = 0;
    harness.loading = loading;
    harness.unavailable = unavailable;
    const tree = Location({
      id: "location",
      value: null,
      bookmarks: false,
      onChange: vi.fn(),
    });
    expect(child(tree, 0).options).toHaveLength(expected);
  }
});
it.each(["h", "ho", "hom"])(
  "searches bookmarks immediately and debounces the provider only from three characters: %s",
  async (query) => {
    vi.useFakeTimers();
    harness.query = query;
    const request = vi.fn(async (_url: string) => ({
      ok: true,
      json: async () => ({ saved: [], results: [], unavailable: false }),
    }));
    vi.stubGlobal("fetch", request);
    Location({ id: "location", value: null, onChange: vi.fn() });
    const cleanup = harness.effects[1]();
    expect(request).toHaveBeenCalledOnce();
    expect(request.mock.calls[0][0]).toContain("savedOnly=true");
    await vi.advanceTimersByTimeAsync(199);
    expect(request).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(1);
    expect(request).toHaveBeenCalledTimes(query.length >= 3 ? 2 : 1);
    if (query.length >= 3)
      expect(request.mock.calls[1][0]).toContain("savedOnly=false");
    if (cleanup) cleanup();
  },
);
it("opens a prefilled native drawer without creating a bookmark immediately", () => {
  const request = vi.fn();
  vi.stubGlobal("fetch", request);
  const tree = Location({ id: "location", value: place, onChange: vi.fn() });
  child(tree, 0).onBookmark();
  expect(harness.openDrawer).toHaveBeenCalledOnce();
  expect(request).not.toHaveBeenCalled();
  expect(child(tree, 1).initialData).toEqual({
    alias: "",
    ...place,
  });
  expect(child(tree, 1).redirectAfterCreate).toBe(false);
});
it("selects the saved drawer document and closes after a successful save", () => {
  const onChange = vi.fn();
  vi.stubGlobal("requestAnimationFrame", (callback: () => void) => callback());
  vi.stubGlobal("document", { getElementById: () => ({ focus: vi.fn() }) });
  const tree = Location({ id: "location", value: place, onChange });
  const doc = {
    id: 12,
    alias: "Workshop",
    address: "New address",
    coordinates: [14, 53],
  };
  child(tree, 1).onSave({ doc });
  expect(onChange).toHaveBeenCalledWith({
    id: 12,
    alias: "Workshop",
    address: "New address",
    coordinates: [14, 53],
  });
  expect(harness.closeDrawer).toHaveBeenCalledOnce();
});
it("keeps event values untouched until the drawer saves", () => {
  const onChange = vi.fn();
  const tree = Location({ id: "location", value: place, onChange });
  child(tree, 0).onBookmark();
  expect(onChange).not.toHaveBeenCalled();
});

it("opens an existing bookmark in edit mode", () => {
  harness.bookmark = { ...place, id: 12, alias: "Workshop" };
  const tree = Location({ id: "location", value: place, onChange: vi.fn() });
  expect(harness.drawerArgs).toHaveBeenCalledWith({
    collectionSlug: "locations",
    id: 12,
  });
  expect(child(tree, 0).bookmarked).toBe(true);
  expect(child(tree, 1).initialData).toBeUndefined();
  child(tree, 0).onBookmark();
  expect(harness.openDrawer).toHaveBeenCalledOnce();
});

it("stops editing the previous bookmark as soon as a different point is selected", () => {
  harness.bookmark = { ...place, id: 12, alias: "Workshop" };
  const next = {
    coordinates: [10, 53] as [number, number],
    address: "Hamburg",
  };
  const tree = Location({ id: "location", value: next, onChange: vi.fn() });
  expect(harness.drawerArgs).toHaveBeenLastCalledWith({
    collectionSlug: "locations",
    id: undefined,
  });
  expect(child(tree, 0).bookmarked).toBe(false);
  expect(child(tree, 1).initialData).toEqual({ alias: "", ...next });
  child(tree, 0).onBookmark();
  expect(harness.openDrawer).toHaveBeenCalledOnce();
});

it.each([null, "Hamburg"])(
  "cannot open the old bookmark after clearing or editing its address: %s",
  (query) => {
    harness.bookmark = { ...place, id: 12, alias: "Workshop" };
    harness.query = query;
    const tree = Location({
      id: "location",
      value: query ? place : null,
      onChange: vi.fn(),
    });
    expect(child(tree, 0).bookmarked).toBe(false);
    expect(child(tree, 0).bookmarkDisabled).toBe(true);
    expect(harness.drawerArgs).toHaveBeenLastCalledWith({
      collectionSlug: "locations",
      id: undefined,
    });
    child(tree, 0).onBookmark();
    expect(harness.openDrawer).not.toHaveBeenCalled();
  },
);

it("resets an unsaved drawer when the selected coordinates or address change", () => {
  const render = (value: typeof place) => {
    harness.state = 0;
    return Location({ id: "location", value, onChange: vi.fn() }).props
      .children[1] as ReactElement;
  };
  const first = render(place);
  const moved = render({ ...place, coordinates: [10, 53] });
  const renamed = render({ ...place, address: "Different address" });
  expect(first.key).not.toBe(moved.key);
  expect(first.key).not.toBe(renamed.key);
});
