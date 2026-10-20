import { afterEach, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => ({
  effects: [] as (() => (() => void) | void)[],
  events: {} as Record<string, (event: any) => void>,
  markerRemove: vi.fn(),
  mapRemove: vi.fn(),
  disconnect: vi.fn(),
  latitude: 52.52,
}));
vi.mock("react", async (original) => ({
  ...(await original<typeof import("react")>()),
  useRef: (value: unknown) => ({ current: value ?? {} }),
  useState: (initial: unknown) => [initial, vi.fn()],
  useEffect: (effect: () => (() => void) | void) =>
    harness.effects.push(effect),
}));
vi.mock("leaflet", () => {
  const layer = () => ({
    addTo() {
      return this;
    },
    on(name: string, handler: (event: any) => void) {
      harness.events[name] = handler;
      return this;
    },
    setView() {
      return this;
    },
    setLatLng() {
      return this;
    },
    getZoom: () => 14,
    getLatLng: () => ({ wrap: () => ({ lng: 0, lat: harness.latitude }) }),
    remove: harness.mapRemove,
  });
  return {
    map: layer,
    marker: () => ({ ...layer(), remove: harness.markerRemove }),
    tileLayer: layer,
    icon: (options: { iconUrl?: string }) => {
      if (!options.iconUrl) throw new Error("Missing marker icon");
      return options;
    },
  };
});
import { LocationMap } from "./LocationMap";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  harness.effects.length = 0;
  harness.events = {};
});

it("selects map clicks and pin drags, removes the pin on clear, and disposes the map", async () => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect = harness.disconnect;
    },
  );
  const onSelect = vi.fn();
  LocationMap({
    point: null,
    disabled: false,
    onSelect,
    label: "Map",
    errorLabel: "Failed",
  });
  const cleanup = harness.effects[0]();
  await vi.dynamicImportSettled();
  harness.events.click({ latlng: { lat: 0, wrap: () => ({ lng: 0 }) } });
  harness.events.dragend({});
  expect(onSelect.mock.calls).toEqual([
    [{ coordinates: [0, 0] }],
    [{ coordinates: [0, 52.52] }],
  ]);
  harness.effects[1]();
  expect(harness.markerRemove).toHaveBeenCalledOnce();
  cleanup?.();
  expect(harness.mapRemove).toHaveBeenCalledOnce();
  expect(harness.disconnect).toHaveBeenCalledOnce();
});

it("does not load a map after unmounting or accept edits while disabled", async () => {
  LocationMap({
    point: null,
    disabled: true,
    onSelect: vi.fn(),
    label: "Map",
    errorLabel: "Failed",
  });
  harness.effects[0]()!();
  await vi.dynamicImportSettled();
  expect(harness.events).toEqual({});
});
