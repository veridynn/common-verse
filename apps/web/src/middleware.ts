import { defineMiddleware } from "astro:middleware";
import {
  defaultLocale,
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
      /^\/(workshops|poems|poets)(\/[^/]+)?\/?$/.test(identity)) &&
    pathname !== canonical
  ) {
    return context.redirect(`${canonical}${search}`, 308);
  }
  if (
    locale === defaultLocale &&
    (identity === "/" ||
      /^\/(workshops|poems|poets)(\/[^/]+)?\/?$/.test(identity))
  ) {
    return next(
      new URL(`/de${identity === "/" ? "" : identity}${search}`, context.url),
    );
  }
  return next();
});
