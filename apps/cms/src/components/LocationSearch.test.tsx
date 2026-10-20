import { Children, isValidElement, type ReactElement } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { ReactSelect } from "@payloadcms/ui";

const harness = vi.hoisted(() => ({
  state: 0,
  language: "en",
  menuOpen: false,
  setMenuOpen: vi.fn(),
}));
vi.mock("react", async (original) => ({
  ...(await original<typeof import("react")>()),
  useState: () => [harness.menuOpen, harness.setMenuOpen],
  useEffect: vi.fn(),
}));
vi.mock("@payloadcms/ui", () => ({
  ReactSelect: vi.fn(),
  SearchIcon: vi.fn(),
  XIcon: vi.fn(),
  useTranslation: () => ({ i18n: { language: harness.language } }),
}));
import { LocationSearch } from "./LocationSearch";

function propsOf(tree: ReactElement, component: unknown): Record<string, any> {
  if (tree.type === component) return tree.props as Record<string, any>;
  for (const child of Children.toArray(
    (tree.props as { children?: React.ReactNode }).children,
  )) {
    if (isValidElement(child)) {
      const props = propsOf(child, component);
      if (Object.keys(props).length) return props;
    }
  }
  return {};
}
const props = () => ({
  id: "location",
  text: "",
  options: [],
  loading: false,
  disabled: false,
  showError: false,
  onQuery: vi.fn(),
  onSelect: vi.fn(),
  onClear: vi.fn(),
  selection: null,
  bookmarked: false,
  bookmarkDisabled: true,
  onBookmark: vi.fn(),
});
afterEach(() => {
  harness.state = 0;
  harness.language = "en";
  harness.menuOpen = false;
  vi.clearAllMocks();
});

it("uses the editor interface direction for Arabic search", () => {
  harness.language = "ar";
  const tree = LocationSearch(props());
  expect(tree.props.dir).toBe("rtl");
  expect(propsOf(tree, ReactSelect).isRtl).toBe(true);
});

it("does not overwrite the first typed query when the suggestion menu opens", () => {
  const input = props();
  const select = propsOf(LocationSearch(input), ReactSelect);
  select.onInputChange("Berlin", { action: "input-change" });
  select.onMenuOpen();
  expect(input.onQuery.mock.calls).toEqual([["Berlin"]]);
});

it("opens suggestions on focus, click and clear, including before typing", () => {
  const tree = LocationSearch({
    ...props(),
    text: "Berlin",
    showBookmark: false,
  });
  const select = propsOf(tree, ReactSelect);
  expect(select.menuIsOpen).toBe(false);
  expect(select.openMenuOnFocus).toBe(true);
  expect(select.openMenuOnClick).toBe(true);
  select.onMenuOpen();
  expect(harness.setMenuOpen).toHaveBeenLastCalledWith(true);
  select.onInputChange("Ber", { action: "input-change" });
  expect(harness.setMenuOpen).toHaveBeenLastCalledWith(true);
  vi.stubGlobal("document", { getElementById: () => ({ focus: vi.fn() }) });
  propsOf(tree, "button").onClick();
  expect(harness.setMenuOpen).toHaveBeenLastCalledWith(true);
  vi.unstubAllGlobals();
});

it("keeps empty focus, short searches and pending searches quiet", () => {
  harness.menuOpen = true;
  for (const text of ["", "h", "ho"]) {
    const select = propsOf(LocationSearch({ ...props(), text }), ReactSelect);
    expect(select.menuIsOpen).toBe(false);
  }
  const pending = propsOf(
    LocationSearch({ ...props(), text: "home", loading: true }),
    ReactSelect,
  );
  expect(pending.menuIsOpen).toBe(false);
  const finished = propsOf(
    LocationSearch({ ...props(), text: "home" }),
    ReactSelect,
  );
  expect(finished.noOptionsMessage()).toBe("No places found");
  expect(finished.menuIsOpen).toBe(true);
  const bookmarks = propsOf(
    LocationSearch({
      ...props(),
      loading: true,
      options: [
        {
          value: "saved-1",
          label: "Home",
          place: { coordinates: [0, 0] },
          saved: true,
        },
      ],
    }),
    ReactSelect,
  );
  expect(bookmarks.menuIsOpen).toBe(true);
});

it("opens bookmark creation and editing from a suffix button", () => {
  for (const bookmarked of [false, true]) {
    const input = props();
    const tree = LocationSearch({ ...input, bookmarked });
    const button = propsOf(tree, "button");
    expect(button["aria-label"]).toBe(
      bookmarked ? "Edit saved location" : "Bookmark selected place",
    );
    button.onClick();
    expect(input.onBookmark).toHaveBeenCalledOnce();
  }
});
it("omits the bookmark button in Locations forms", () => {
  const tree = LocationSearch({ ...props(), showBookmark: false });
  expect(propsOf(tree, "button")).toEqual({});
});

it("keeps the selected place as a real required value while showing editable search text", () => {
  const selection = {
    address: "Berlin",
    coordinates: [13.4, 52.5] as [number, number],
  };
  const select = propsOf(
    LocationSearch({ ...props(), required: true, selection, text: "Berlin" }),
    ReactSelect,
  );
  expect(select.required).toBe(true);
  expect(select.value.place).toEqual(selection);
  expect(select.inputValue).toBe("Berlin");
  expect(select.controlShouldRenderValue).toBe(false);
});
