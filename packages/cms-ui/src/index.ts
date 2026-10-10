import { isLocale } from "@poetry/i18n";
import { m as messages } from "./paraglide/messages.js";

export const editorLocales = ["en", "de", "ar", "fa", "uk"] as const;
export type EditorLocale = (typeof editorLocales)[number];
export type MessageKey = keyof typeof messages;

export function editorLocale(language?: string): EditorLocale {
  return isLocale(language) && language !== "ku" ? language : "en";
}

export function message(key: MessageKey, language?: string): string {
  return messages[key]({}, { locale: editorLocale(language) });
}

/** Payload resolves translated label objects using its interface preference. */
export function label(key: MessageKey): Record<EditorLocale, string> {
  return Object.fromEntries(
    editorLocales.map((locale) => [locale, message(key, locale)]),
  ) as Record<EditorLocale, string>;
}
