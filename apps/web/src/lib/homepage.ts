import {
  getLocaleMetadata,
  isLocale,
  localizedPath,
  type Locale,
} from "@poetry/i18n";
import type {
  HomepageSection,
  MediaReference,
  Poem,
  Workshop,
} from "@poetry/types";

export function contentDirection(language: string) {
  return isLocale(language) ? getLocaleMetadata(language).direction : "auto";
}

export function safeHref(
  value?: string | null,
  locale?: Locale,
): string | undefined {
  if (!value) return undefined;
  if (/^\/(?!\/)/.test(value) && !/[\\\s]/.test(value)) {
    const explicitLocale = value.split("/")[1];
    if (isLocale(explicitLocale))
      return localizedPath(explicitLocale, value.split("/").slice(2).join("/"));
    if (!locale) return value;
    return localizedPath(locale, value);
  }
  try {
    const url = new URL(value);
    if (["https:", "http:", "mailto:"].includes(url.protocol)) return url.href;
  } catch {
    /* Do not render unsafe editorial URLs. */
  }
  return undefined;
}

export function mediaObject(
  value: MediaReference | number | string | null | undefined,
) {
  return value && typeof value === "object" && value.url && value.alt
    ? value
    : null;
}

export function upcomingEvents(
  events: Workshop[],
  pinned: HomepageSection["pinnedEvents"],
  limit: number,
  now = new Date(),
): Workshop[] {
  const upcoming = (event: Workshop) =>
    Boolean(event.title) &&
    event._status !== "draft" &&
    Number.isFinite(Date.parse(event.startDate)) &&
    Date.parse(event.endDate ?? event.startDate) >= now.getTime();
  const selected = (pinned ?? []).filter(
    (event): event is Workshop => typeof event === "object" && upcoming(event),
  );
  const ordered = [
    ...selected,
    ...events
      .filter(upcoming)
      .sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate)),
  ];
  const seen = new Set<string>();
  return ordered
    .filter((event) => {
      const id = String(event.id);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .slice(0, Math.max(1, Math.min(6, limit)));
}

export function poemExcerpt(poem: Poem, locale: Locale) {
  const translation = poem.translations?.find(
    (entry) => entry.language === locale,
  );
  return {
    original: poem.originalText.split("\n").slice(0, 5).join("\n"),
    translation,
  };
}
