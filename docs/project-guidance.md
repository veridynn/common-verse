# Project implementation guidance

This guide preserves project decisions previously held in seven `poetry-*` skills.
Reusable framework guidance lives in upstream skills installed through the skills
CLI. Read only the sections relevant to the task, together with `AGENTS.md`.

## Architecture and public rendering

Prefer a direct implementation inside the owning layer. Add shared packages only
when they remove demonstrated duplication. Do not add another public frontend,
CMS, database, commerce backend, or general-purpose UI library without a concrete
missing capability and an architecture review. Use Payload migrations rather than
hand-written application tables.

Astro owns public pages and locale URLs, layouts, metadata, server
rendering, and Payload integration. Render useful HTML on the server. Reuse Svelte
components directly from Astro, including noninteractive components; hydrate only
components that need browser state or events. Avoid `client:only`, broad
`client:load`, and SPA routing.

Validate route parameters with `@poetry/i18n`. Fetch published Payload content
server-side. Preview URLs may request drafts only after verifying the preview
secret. Consider metadata, locale alternates, direction, empty/error behavior, and
keyboard behavior when adding pages. Stripe and ecommerce remain deferred until
the CMS milestone is reviewed and a separate implementation decision is made.

## Editorial modeling

Model editor meaning rather than anticipated layouts. Prefer a few intentional
blocks over unrestricted visual configuration. Add a field only when editors can
understand when to use it and the frontend has a clear rendering contract.

Poems preserve one original title, language, and text, plus zero or more explicit
translation records, each with language, title, text, and translator attribution.
Never require one translation per site locale or hide the original based on the
UI locale. Keep shared facts such as dates, media relationships, and IDs
unlocalized. Localize editorial prose and labels where independent translations
make sense.

## Locales and translation domains

Supported locales are `de`, `en`, `ar`, `fa`, `uk`, and `ku` (Kurmanji). Locale
direction and labels live in `@poetry/i18n`; do not duplicate direction
conditionals. Arabic and Persian are RTL; Kurmanji is LTR.

German is the default language at `/`, with unprefixed content URLs. Other
languages use their locale prefix. Legacy `/de` URLs redirect permanently to the
unprefixed equivalent. Build links, canonicals, and preview URLs with
`localizedPath`; the language picker preserves the content path, query, and anchor.

Keep three translation domains separate:

- UI messages: Paraglide message JSON in Git.
- Ordinary editorial fields: Payload field localization with fallback disabled.
- Poems: the original and explicit optional translations described above.

Never imply untranslated content is translated. Missing editorial translations
must be visible as missing or handled by an explicitly designed fallback. Adding
a locale requires central metadata, Paraglide, Payload, tests, SEO alternates, and
editor documentation to be updated together. Documents declare the routed locale
in `lang` and `dir`; embedded originals and translations declare their own
language and direction.

## UI and accessibility

Use project-owned shadcn-svelte source first and Bits UI when a lower-level
accessible primitive is needed. Keep tokens in `apps/web/src/styles/token.css`, imported by `global.css`,
and build project components on top of them. Do not add another component
framework. A component should not be hydrated merely because it uses Svelte.

The primary colour is the old site's yellow, `#f1a60a`. Use semantic tokens for
surfaces, text, controls, and status colours. Light, dark, and system preferences
share the same tokens; see [design-tokens.md](design-tokens.md).

Components must work in LTR and RTL, expose semantic HTML, retain visible focus,
and respect reduced motion. Prefer logical CSS properties. Preserve native
controls, keyboard operation, accessible names, useful error text, and WCAG AA
contrast. Use the existing component primitives for patterns needing managed
focus or ARIA. Verify affected UI with keyboard input, a narrow viewport, German
or English, and Arabic or Persian. Use `web-accessibility` for deeper evaluation;
record checks actually performed rather than claiming accessibility from a scan.

## Metadata and sharing

Each indexable page needs a stable localized canonical URL, useful title and
description, alternates for actually routable language versions, and `x-default`
where appropriate. Keep document language and direction aligned with the route.
Support editor-provided Open Graph images and suitable Twitter card metadata.
Preview and intentionally hidden content must emit `noindex,nofollow`.

Add structured data only when enough accurate fields exist; do not invent missing
facts. Automated social-image generation remains deferred until the base metadata
workflow is proven.

## Validation

Use Vitest for deterministic logic and Playwright for observable browser behavior.
Cover the smallest critical behavior for public UI changes rather than mirroring
implementation details. Maintain smoke coverage for all six locale routes,
Arabic/Persian RTL, Kurmanji LTR, localized workshops, draft preview authorization,
language switching, keyboard navigation, and browser console errors.

Run the relevant narrow test first, then `pnpm check`, `pnpm test`, and affected
builds for implementation changes. Use `pnpm lint` for formatting. The current
Playwright suite starts a mock CMS and built web server locally; checks of the real
editor-to-database flow require PostgreSQL and both applications running. Skills
installation and documentation changes require checking discovery, lockfile
consistency, links, and formatting rather than rerunning unrelated app tests.

The current suite has Chromium smoke coverage. Broader keyboard tasks, automated
axe checks, additional browser coverage, and CI are follow-up work; installing a
skill does not implement those checks.
