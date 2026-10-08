import { defineMiddleware } from "astro:middleware";
import { defaultLocale, localizedPath, unlocalizedPath } from "@poetry/i18n";

/** German is canonical at /; existing locale templates still own rendering. */
export const onRequest = defineMiddleware((context, next) => {
  const { pathname, search } = context.url;
  if (pathname === "/de" || pathname.startsWith("/de/")) {
    return context.redirect(
      `${localizedPath(defaultLocale, unlocalizedPath(pathname))}${search}`,
      308,
    );
  }
  if (
    pathname === "/" ||
    /^\/(workshops|poems|poets)(\/[^/]+)?\/?$/.test(pathname)
  ) {
    return next(
      new URL(
        `/${defaultLocale}${pathname === "/" ? "" : pathname}${search}`,
        context.url,
      ),
    );
  }
  return next();
});
