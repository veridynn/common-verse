import { defineMiddleware } from "astro:middleware";
import {
  defaultLocale,
  fixedPageKeys,
  isLocale,
  localizedPath,
  unlocalizedPath,
} from "@poetry/i18n";

/** Resolve public names centrally; locale templates still own rendering. */
export const onRequest = defineMiddleware((context, next) => {
  const { pathname, search } = context.url;
  const prefix = pathname.split("/")[1];
  const locale = isLocale(prefix) ? prefix : defaultLocale;
  const identity = unlocalizedPath(pathname);
  const canonical = localizedPath(locale, identity);
  if (
    (prefix === "de" ||
      /^\/(workshops|poems|poets|articles)(\/[^/]+)?\/?$/.test(identity)) &&
    pathname !== canonical
  ) {
    return context.redirect(`${canonical}${search}`, 308);
  }
  if (
    locale === defaultLocale &&
    (identity === "/" ||
      fixedPageKeys.some((page) => identity === `/${page}`) ||
      /^\/(workshops|poems|poets|articles)(\/[^/]+)?\/?$/.test(identity))
  ) {
    return next(
      new URL(`/de${identity === "/" ? "" : identity}${search}`, context.url),
    );
  }
  return next();
});
