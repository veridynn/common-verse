export const locales = ["de", "en", "ar", "fa", "uk", "ku"] as const;

export type Locale = (typeof locales)[number];
export type Direction = "ltr" | "rtl";

export interface LocaleMetadata {
  code: Locale;
  direction: Direction;
  label: string;
  englishLabel: string;
}

export const localeMetadata: Record<Locale, LocaleMetadata> = {
  de: {
    code: "de",
    direction: "ltr",
    label: "Deutsch",
    englishLabel: "German",
  },
  en: {
    code: "en",
    direction: "ltr",
    label: "English",
    englishLabel: "English",
  },
  ar: {
    code: "ar",
    direction: "rtl",
    label: "العربية",
    englishLabel: "Arabic",
  },
  fa: { code: "fa", direction: "rtl", label: "فارسی", englishLabel: "Persian" },
  uk: {
    code: "uk",
    direction: "ltr",
    label: "Українська",
    englishLabel: "Ukrainian",
  },
  ku: {
    code: "ku",
    direction: "ltr",
    label: "Kurdî",
    englishLabel: "Kurdish (Kurmanji)",
  },
};

export const defaultLocale: Locale = "de";

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export function getLocaleMetadata(locale: Locale): LocaleMetadata {
  return localeMetadata[locale];
}

export function localizedPath(locale: Locale, path = ""): string {
  const normalized = path.replace(/^\/+|\/+$/g, "");
  const suffix = normalized ? `/${normalized}` : "";
  return locale === defaultLocale ? suffix || "/" : `/${locale}${suffix}`;
}

/** Removes an optional locale prefix from a public pathname. */
export function unlocalizedPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (isLocale(segments[0])) segments.shift();
  return segments.length ? `/${segments.join("/")}` : "/";
}
