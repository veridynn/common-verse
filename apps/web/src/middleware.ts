import { defineMiddleware } from "astro:middleware";
import {
  defaultLocale,
  fixedPageKeys,
  isLocale,
  localizedPath,
  unlocalizedPath,
} from "@poetry/i18n";

/** German URLs render through the same locale templates without redirects. */
export const onRequest = defineMiddleware((context, next) => {
  const { pathname, search } = context.url;
  const prefix = pathname.split("/")[1];
  const locale = isLocale(prefix) ? prefix : defaultLocale;
  const identity = unlocalizedPath(pathname);
  const mainPage =
    identity === "/" ||
    fixedPageKeys.some((page) => identity === `/${page}`) ||
    /^\/(events|poems|authors|articles)$/.test(identity);
  const knownPage =
    mainPage || /^\/(events|poems|authors|articles)\/[^/]+\/?$/.test(identity);
  const canonicalPath = localizedPath(locale, identity);
  if (knownPage && pathname !== canonicalPath) {
    return new Response("Not found", { status: 404 });
  }
  if (locale === defaultLocale && knownPage) {
    return next(
      new URL(`/de${identity === "/" ? "" : identity}${search}`, context.url),
    );
  }
  return next();
});
