"use client";

import { ReactSelect, XIcon, useTranslation } from "@payloadcms/ui";
import { editorLocale, message } from "@poetry/cms-ui";
import { getLocaleMetadata } from "@poetry/i18n";
import { useEffect, useState } from "react";
import type { LocationValue, SavedLocation } from "../utilities/locations";
import { locationAddress } from "../utilities/locations-client";
import styles from "./Location.module.css";

type LocationOption = {
  value: string;
  label: string;
  place: LocationValue & Partial<SavedLocation>;
  saved: boolean;
};

function BookmarkIcon({
  filled = false,
  add = false,
}: {
  filled?: boolean;
  add?: boolean;
}) {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    >
      <path d={add ? "M6 3h8M6 3v18l6-4 6 4v-8" : "M6 3h12v18l-6-4-6 4V3Z"} />
      {add && <path d="M19 2v8m-4-4h8" />}
    </svg>
  );
}

export function LocationSearch({
  id,
  text,
  options,
  loading,
  disabled,
  showError,
  required = false,
  onQuery,
  onSelect,
  onClear,
  selection,
  editing = false,
  bookmarked,
  bookmarkDisabled,
  onBookmark,
  showBookmark = true,
}: {
  id: string;
  text: string;
  options: LocationOption[];
  loading: boolean;
  disabled: boolean;
  showError: boolean;
  required?: boolean;
  onQuery: (query: string) => void;
  onSelect: (place: LocationValue) => void;
  onClear: () => void;
  selection: (LocationValue & Partial<SavedLocation>) | null;
  editing?: boolean;
  bookmarked: boolean;
  bookmarkDisabled: boolean;
  onBookmark: () => void;
  showBookmark?: boolean;
}) {
  const { i18n } = useTranslation();
  const m = (key: Parameters<typeof message>[0]) => message(key, i18n.language);
  const rtl =
    getLocaleMetadata(editorLocale(i18n.language)).direction === "rtl";
  const [menuOpen, setMenuOpen] = useState(false);
  const showSelectedAlias = Boolean(selection?.alias && !editing);
  useEffect(() => {
    if (selection) setMenuOpen(false);
  }, [selection?.coordinates[0], selection?.coordinates[1]]);
  return (
    <div className={styles.searchField} dir={rtl ? "rtl" : "ltr"}>
      <div className={styles.searchRow}>
        <div
          className={`${styles.searchControl} ${showBookmark ? styles.withBookmark : ""}`}
        >
          {showBookmark && (
            <button
              type="button"
              id={`${id}-bookmark`}
              className={styles.bookmarkToggle}
              disabled={disabled || bookmarkDisabled}
              aria-label={m(
                bookmarked ? "location_bookmark_edit" : "location_bookmark_add",
              )}
              title={m(
                bookmarked ? "location_bookmark_edit" : "location_bookmark_add",
              )}
              onClick={onBookmark}
            >
              <BookmarkIcon filled={bookmarked} add={!bookmarked} />
            </button>
          )}
          <ReactSelect
            inputId={id}
            components={{
              DropdownIndicator: () => null,
            }}
            disabled={disabled}
            isClearable={false}
            showError={showError}
            isLoading={loading}
            value={
              selection
                ? {
                    value: "selected",
                    label: selection.alias || locationAddress(selection),
                    place: selection,
                    saved: bookmarked,
                  }
                : []
            }
            menuIsOpen={
              menuOpen &&
              (options.length > 0 || (!loading && text.trim().length >= 3))
            }
            placeholder={m("location_address")}
            {...{
              inputValue: showSelectedAlias ? "" : text,
              required,
              "aria-invalid": showError,
              "aria-errormessage": showError ? `${id}-error` : undefined,
              controlShouldRenderValue: showSelectedAlias,
              // Keep text visible; onChange closes the controlled menu.
              closeMenuOnSelect: false,
              openMenuOnFocus: true,
              openMenuOnClick: true,
              formatOptionLabel: (
                option: LocationOption,
                { context }: { context: "menu" | "value" },
              ) => (
                <div className={styles.result}>
                  {option.saved && context === "menu" && (
                    <>
                      <BookmarkIcon filled />
                      <span className={styles.visuallyHidden}>
                        {m("saved_places")}:{" "}
                      </span>
                    </>
                  )}
                  <span
                    className={
                      option.saved ? styles.bookmarkText : styles.resultText
                    }
                    title={
                      option.place.alias
                        ? `${option.label} ${locationAddress(option.place)}`
                        : option.label
                    }
                  >
                    {option.place.alias ? (
                      <>
                        <strong>{option.label}</strong>{" "}
                        {locationAddress(option.place)}
                      </>
                    ) : (
                      option.label
                    )}
                  </span>
                </div>
              ),
              isRtl: rtl,
            }}
            options={options}
            filterOption={() => true}
            noOptionsMessage={() => m("place_no_results")}
            onInputChange={(input, meta?: { action: string }) => {
              if (meta?.action === "input-change") {
                onQuery(input);
                setMenuOpen(true);
              }
            }}
            onMenuOpen={() => {
              setMenuOpen(true);
            }}
            onMenuClose={() => setMenuOpen(false)}
            onChange={(option) => {
              if (option && !Array.isArray(option) && option.place) {
                onSelect(option.place as LocationValue);

                setMenuOpen(false);
              }
            }}
          />
          {text && (
            <button
              type="button"
              className={styles.clearSearch}
              disabled={disabled}
              aria-label={m("place_search_clear")}
              onClick={() => {
                onQuery("");
                setMenuOpen(true);
                onClear();
                document.getElementById(id)?.focus();
              }}
            >
              <span aria-hidden="true">
                <XIcon />
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
