"use client";

import { useDocumentDrawer, useLocale, useTranslation } from "@payloadcms/ui";
import { message } from "@poetry/cms-ui";
import { useEffect, useRef, useState } from "react";
import type { Location as LocationDocument } from "../payload-types";
import type {
  LocationResults,
  LocationValue,
  SavedLocation,
} from "../utilities/locations";
import {
  locationAddress,
  sameLocation,
  savedLocation,
} from "../utilities/locations-client";
import { LocationMap } from "./LocationMap";
import { LocationSearch } from "./LocationSearch";
import styles from "./Location.module.css";

const emptyResults: LocationResults = {
  saved: [],
  results: [],
  unavailable: false,
};

export function Location({
  id,
  value,
  disabled = false,
  showError = false,
  required = false,
  bookmarks = true,
  onChange,
}: {
  id: string;
  value: LocationValue | null;
  disabled?: boolean;
  showError?: boolean;
  required?: boolean;
  bookmarks?: boolean;
  onChange: (place: LocationValue | null) => void;
}) {
  const { i18n } = useTranslation();
  const locale = useLocale();
  const m = (key: Parameters<typeof message>[0]) => message(key, i18n.language);
  const [query, setQuery] = useState<string | null>(null);
  const [results, setResults] = useState(emptyResults);
  const [loading, setLoading] = useState(false);
  const [bookmark, setBookmark] = useState<SavedLocation | null>(null);
  const [findingBookmark, setFindingBookmark] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState("");
  const reverse = useRef<AbortController | null>(null);
  const selectedBookmark =
    bookmarks &&
    query === null &&
    value &&
    bookmark &&
    sameLocation(value, bookmark)
      ? bookmark
      : null;
  const [DocumentDrawer, , { openDrawer, closeDrawer }] = useDocumentDrawer({
    collectionSlug: "locations",
    id: selectedBookmark?.id,
  });

  useEffect(() => () => reverse.current?.abort(), []);

  useEffect(() => {
    const controller = new AbortController();
    const term = query?.trim() ?? "";
    const remote = term.length >= 3;
    setResults((current) => ({ ...emptyResults, saved: current.saved }));
    setLoading(remote);
    async function search(savedOnly: boolean) {
      try {
        const params = new URLSearchParams({
          q: term,
          lang: locale.code,
          savedOnly: String(savedOnly),
          includeSaved: String(bookmarks),
        });
        const response = await fetch(`/api/locations/search?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error();
        const data: LocationResults = await response.json();
        if (controller.signal.aborted) return;
        if (savedOnly)
          setResults((current) => ({
            ...current,
            saved: [
              ...data.saved,
              ...current.saved.filter(
                (place) => !data.saved.some((other) => other.id === place.id),
              ),
            ],
          }));
        else {
          setResults(data);
          if (data.unavailable) setError(m("place_search_failed"));
        }
      } catch {
        if (!controller.signal.aborted) {
          if (!savedOnly)
            setResults((current) => ({ ...current, unavailable: true }));
          setError(
            m(savedOnly ? "saved_places_failed" : "place_search_failed"),
          );
        }
      } finally {
        if (!controller.signal.aborted && (!savedOnly || !remote))
          setLoading(false);
      }
    }
    if (bookmarks) void search(true);
    const remoteTimer = remote
      ? setTimeout(() => void search(false), 200)
      : undefined;
    return () => {
      controller.abort();
      clearTimeout(remoteTimer);
    };
  }, [query, locale.code, revision, i18n.language, bookmarks]);

  useEffect(() => {
    const controller = new AbortController();
    setBookmark(null);
    setFindingBookmark(false);
    if (!bookmarks || !value) return () => controller.abort();
    setFindingBookmark(true);
    const params = new URLSearchParams({
      limit: "1",
      sort: "id",
      "where[coordinates][near]": JSON.stringify([...value.coordinates, 1]),
    });
    fetch(`/api/locations?${params}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!controller.signal.aborted) {
          setBookmark(data.docs[0] ? savedLocation(data.docs[0]) : null);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(m("saved_places_failed"));
      })
      .finally(() => {
        if (!controller.signal.aborted) setFindingBookmark(false);
      });
    return () => controller.abort();
  }, [value?.coordinates[0], value?.coordinates[1], bookmarks, i18n.language]);

  function select(place: LocationValue | null) {
    if (disabled) return;
    reverse.current?.abort();
    setResolving(false);
    setQuery(null);
    setError("");
    onChange(place);
    if (place && !place.address) void selectPoint(place);
  }

  async function selectPoint(point: LocationValue) {
    if (disabled) return;
    reverse.current?.abort();
    const controller = new AbortController();
    reverse.current = controller;
    const next = {
      coordinates: point.coordinates.map((number) =>
        Number(number.toFixed(6)),
      ) as [number, number],
      address: "",
    };
    onChange(next);
    setQuery(null);
    setResolving(true);
    setError("");
    let selected: LocationValue = next;
    try {
      const params = new URLSearchParams({
        lat: String(next.coordinates[1]),
        lon: String(next.coordinates[0]),
        lang: locale.code,
      });
      const response = await fetch(`/api/locations/reverse?${params}`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error();
      const place = await response.json();
      if (!controller.signal.aborted) {
        selected = {
          ...next,
          address: typeof place.address === "string" ? place.address : "",
        };
        onChange(selected);
        if (place.unavailable) setError(m("place_reverse_failed"));
      }
    } catch {
      if (!controller.signal.aborted) setError(m("place_reverse_failed"));
    } finally {
      if (!controller.signal.aborted) {
        setResolving(false);
      }
    }
  }

  function openBookmark() {
    if (
      bookmarks &&
      query === null &&
      value &&
      !disabled &&
      !findingBookmark &&
      !resolving
    )
      openDrawer();
  }

  const term = query?.trim().toLocaleLowerCase() ?? "";
  const saved = bookmarks
    ? results.saved.filter(
        (place) =>
          !term ||
          [place.alias, place.address].some((text) =>
            text?.toLocaleLowerCase().includes(term),
          ),
      )
    : [];
  const options = [
    ...saved.map((place) => ({
      value: `saved-${place.id}`,
      label: place.alias || locationAddress(place),
      place,
      saved: true,
    })),
    ...results.results
      .filter((place) => !saved.some((other) => sameLocation(place, other)))
      .map((place, index) => ({
        value: `result-${index}`,
        label: locationAddress(place),
        place,
        saved: false,
      })),
  ];
  return (
    <div className={styles.picker}>
      <LocationSearch
        id={id}
        text={query ?? (value ? locationAddress(value) : "")}
        options={options}
        loading={loading || resolving}
        disabled={disabled}
        showError={showError}
        required={required}
        onQuery={(next) => {
          setQuery(next);
          setError("");
        }}
        onSelect={select}
        onClear={() => select(null)}
        selection={value}
        bookmarked={Boolean(selectedBookmark)}
        showBookmark={bookmarks}
        bookmarkDisabled={
          query !== null || !value || findingBookmark || resolving
        }
        onBookmark={openBookmark}
      />
      {bookmarks && (
        <DocumentDrawer
          key={JSON.stringify([
            selectedBookmark?.id,
            value?.coordinates,
            value?.address,
          ])}
          initialData={
            !selectedBookmark && value
              ? {
                  alias: "",
                  ...value,
                }
              : undefined
          }
          redirectAfterCreate={false}
          onDelete={() => {
            setBookmark(null);
            setRevision((current) => current + 1);
            closeDrawer();
          }}
          onSave={({ doc }) => {
            const place = savedLocation(doc as LocationDocument);
            reverse.current?.abort();
            setResolving(false);
            setBookmark(place);
            setQuery(null);
            setError("");
            setRevision((current) => current + 1);
            onChange(place);
            closeDrawer();
            requestAnimationFrame(() =>
              document.getElementById(`${id}-bookmark`)?.focus(),
            );
          }}
        />
      )}
      <LocationMap
        point={value}
        disabled={disabled}
        onSelect={selectPoint}
        label={m("location_map")}
        errorLabel={m("place_map_failed")}
      />
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
