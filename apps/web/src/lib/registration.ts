import type { Locale } from "@poetry/i18n";
import { safeHref } from "./homepage";

export function registrationHref(
  value: string | null | undefined,
  locale: Locale,
) {
  const url = value?.trim();
  const bareDomain =
    url && /^[\w-]+(?:\.[\w-]+)+(?::\d+)?(?:[/?#]|$)/.test(url);
  return safeHref(bareDomain ? `https://${url}` : url, locale);
}
