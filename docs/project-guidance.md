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
unlocalized. Localize editorial prose and editor-authored link labels where
independent translations make sense. Field labels and other editor controls are
UI, not editorial content.

Poems require an Author relationship when published; drafts may omit it. Authors
are shared writer profiles, independent of CMS user accounts. Their related poems
are shown through Payload’s native join field in the admin. Fixed shared pages do
not need a byline; events describe activities rather than authored texts.

Keep Payload’s native dashboard and cards. Organize the editorial sidebar as
Content (Articles, Events), Media (Images & Files), Administration (Users),
then Pages (Home, About, Contact, Privacy, Legal Notice). Collection IDs, route identities and labels use the same editorial names.

Home, About, Contact, Privacy, and Legal Notice are fixed Payload globals. Event,
poet, and poem detail pages come from their collections. Articles are an MVP collection with localized native rich text, drafts, preview
and public article routes. Do not add arbitrary pages. The legacy `pages` collection remains
hidden to preserve existing records and is not used by public routing or bulk seeding.

Poems and Authors are hidden from admin navigation until v2.0; preserve their
records and existing public routes. Only Administrator and Editor accounts may
edit content. Editors can create and view Editor accounts, but update only their own account.
Account deletion and Administrator role assignment are administrator-only.
Contributor accounts and account-to-author connections are deferred to v2.0.
See [accounts and permissions](accounts-and-permissions.md) for the MVP permission
matrix and the v2.0 authorship, translation and review workflow.

## Locales and translation domains

Supported locales are `de`, `en`, `ar`, `fa`, `uk`, and `ku` (Kurmanji). Locale
direction and labels live in `@poetry/i18n`; do not duplicate direction
conditionals. Arabic and Persian are RTL; Kurmanji is LTR.

The authoritative rules, examples, and implementation plan are in
[translations-and-routing.md](translations-and-routing.md). Keep three buckets
separate:

- Payload UI we define: its own Paraglide/inlang catalog in Git. Payload's standard
  controls retain its built-in translation packs.
- Website UI: a separate Paraglide/inlang catalog in Git.
- Website content: Payload localization and explicit optional poem translations,
  with editorial fallback disabled, except for the four fixed informational pages.

The Payload user's interface language is independent of the content language they
edit. Use English as UI default/fallback, including for unsupported Kurmanji
editor UI. Keep Kurmanji website UI and content supported. Translate displayed
labels and preserve stored field names, option values, and block identifiers.

German is the default content locale and website language at `/`, with unprefixed
German page names. Other languages use locale prefixes and English page names:
the agreed contact example is `/kontakt`, `/ar/contact`, and `/uk/contact`.
Public paths use Latin ASCII characters. Use explicit route mappings rather than
translated UI labels. Central route mappings and `localizedPath` resolve the
same page across languages. Links, canonicals, language alternates, and previews
must agree. The language picker resolves the same page and preserves
query and anchor. Main-page aliases redirect permanently to their canonical localized URLs, for example
`/de` to `/` and `/de/contact` to `/kontakt`. This covers home, fixed informational
pages and collection indexes only. Detail-page aliases and old collection names
return 404; do not add compatibility redirects for them.

About, Contact, Privacy, and Legal Notice use a complete English page when the
requested translation is missing or incomplete. Declare the actual content language
and direction on their article; keep the surrounding UI in the routed locale.
This exception does not apply to Homepage, events, poets, or poems.

Never imply untranslated content is translated. Missing editorial translations
must be visible as missing or handled by an explicitly designed fallback. Adding
a locale requires central metadata, Paraglide, Payload, tests, SEO alternates, and
editor documentation to be updated together. Documents declare the routed locale
in `lang` and `dir`; embedded originals and translations declare their own
language and direction. UI wording is provisional for the MVP/POC; native-speaker
review remains a separate task before public launch.

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
Arabic/Persian RTL, Kurmanji LTR, localized events, draft preview authorization,
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

## Naming contracts

Use Articles (`Article`, `Articles`, `getArticle`, `getArticles`), Events
(`Event`, `Events`, `getEvent`, `getEvents`), Authors, Poems, Media, Users and fixed
Pages in application code and editor labels. Workshops are an event subtype;
poets are authors with published poems, not a separate account or collection.

Articles use the `articles` collection, `/artikel` in German and
`/<locale>/articles` elsewhere. Events use `events`, `/veranstaltungen` and
`/<locale>/events`. Authors use `authors`, `/autoren` and `/<locale>/authors`.
Homepage author sections and relationship fields use `authors` too. Route
segments stay in the central mapping in `@poetry/i18n`, separately from UI
translations. There are no aliases or redirects for old names. Historical
migrations retain the names of the schema they originally created.
