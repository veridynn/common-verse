import { locales, routeSegments } from "@poetry/i18n";

// English fallback is independent of the unprefixed German route language.
const routedLocales = [...locales.filter((locale) => locale !== "de"), "de"];
const urlPatterns = [
  {
    pattern: "/",
    localized: routedLocales.map((locale) => [
      locale,
      locale === "de" ? "/" : `/${locale}`,
    ]),
  },
  ...Object.entries(routeSegments)
    .filter(([key, paths]) => key !== paths.de)
    .flatMap(([key, paths]) =>
      ["", "/:path(.*)?"].map((suffix) => ({
        pattern: `/${key}${suffix}`,
        localized: routedLocales.map((locale) => [
          locale,
          locale === "de"
            ? `/${paths.de}${suffix}`
            : `/${locale}/${paths.international}${suffix}`,
        ]),
      })),
    ),
  {
    pattern: "/:path(.*)?",
    localized: routedLocales.map((locale) => [
      locale,
      locale === "de" ? "/:path(.*)?" : `/${locale}/:path(.*)?`,
    ]),
  },
];

export default {
  project: "./project.inlang",
  outdir: "./src/paraglide",
  outputStructure: "message-modules",
  emitTsDeclarations: true,
  strategy: ["url", "baseLocale"],
  urlPatterns,
};
