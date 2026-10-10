# Translations and language routing

This document records the agreed translation rules and their implementation.
These rules are project requirements.

## Three translation buckets

| Bucket               | Owner                                       | Examples                                                                                                                                                           |
| -------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Payload UI we define | A dedicated Paraglide/inlang catalog in Git | Collection and section names, field labels, descriptions, placeholders, option labels, custom validation messages, custom components, and the draft-preview banner |
| Website UI           | A separate Paraglide/inlang catalog in Git  | Navigation, fixed button labels, language controls, theme controls, and standard empty-state messages                                                              |
| Website content      | Payload editorial data and translations     | Headlines, introductions, biographies, event descriptions, image alternative text, editorial link text, poems, and their explicit translations                     |

Payload's standard controls, such as Publish, Save, and version history, retain
Payload's built-in translation packs. We do not copy or replace those packs in
Paraglide. This is a framework implementation detail within the Payload UI bucket,
not another content or UI catalog owned by the project.

Website and Payload UI catalogs remain separate. Both use Paraglide/inlang, but
they have their own messages and compilation. Share language codes and direction
metadata through `@poetry/i18n`; do not merge the catalogs or couple their wording.
The draft-preview banner is editor UI even though Astro renders it inside the
website preview. Its text belongs to the Payload UI catalog.

Classify text by who authors it, not by the HTML element displaying it. A fixed
navigation label is UI. A button's link text written by an editor is content. The
field label “Project introduction” is UI; the introduction typed into that field
is content. Payload localization stores editorial translations; it does not
automatically write translations for either editorial text or our UI labels.

Poems belong to the website-content bucket. Preserve one original title, language,
and text, plus optional explicit translation records and translator attribution.
Do not treat the original as missing merely because it differs from the website
language, or require a translation in every supported language.

## Independent language choices

The **Payload interface language** is the language chosen by a person using
Payload. It applies to editors and administrators; it is unrelated to their role
or permissions. Existing Payload account preferences own this choice.

The **content language** is the language selected for editing editorial fields.
Changing it selects another content translation. It must not change the interface
language or translate existing saved text automatically.

The **website language** is selected by the public locale route. It determines
website UI messages and the requested content translation. Embedded poem originals
and translations retain their own language and direction.

For example, a user can choose Ukrainian Payload controls, edit English content,
and then preview Arabic content. Their editor controls and draft banner remain
Ukrainian; the preview's website UI becomes Arabic. Switching content languages
must not change the user's interface preference.

## Defaults and missing translations

- English is the default and fallback for project UI translations. A supported
  user preference or selected website locale still takes precedence.
- If a UI translation is missing, use its English message. Keep an English source
  message for every key and make incomplete translation coverage visible during
  development and review.
- Kurmanji (`ku`) falls back to English for the entire Payload interface because
  the installed Payload translation package does not support it. Do not add a
  partial Kurmanji editor language or replace Payload's translation packs.
- Kurmanji remains supported for website UI and editorial content.
- German remains the default content locale and the website language at `/`.
  English UI fallback does not change that routing or content decision.
- Editorial content fallback is disabled. Never silently substitute English,
  German, or another language's editorial text for a missing translation. Omit
  unavailable content or show an appropriate translated UI message. A deliberately
  designed generic UI message may fill an empty area, but must not be presented as
  a translation of missing editorial content.

## Displayed labels and stored values

A label is text the user sees. A stored value is the stable identifier saved in
Payload and read by the application. Translate the label; keep the identifier.

The Poems section's selection mode provides a practical example:

| Payload interface language | Displayed option | Saved value |
| -------------------------- | ---------------- | ----------- |
| English                    | Automatic        | `auto`      |
| Ukrainian                  | Автоматично      | `auto`      |
| German                     | Automatisch      | `auto`      |

Payload saves `selectionMode: "auto"` in every case. The website reads `auto` and
shows the four newest published poems. Translating or rewording the option does
not change the saved setting or require the website to recognize every translated
word. The manual option similarly keeps the value `manual`.

Field names follow the same rule: the UI can translate “Heading”, while the stored
field remains `heading`. Keep collection slugs, block identifiers such as
`introduction`, relationship IDs, and option values stable. Translating UI alone
must not require a database migration or rewrite editorial records.

## Public URL conventions

Astro owns route resolution. URLs use explicit route mappings, independently of
translated navigation labels and internal field names.

- German routes have no locale prefix: `/` and, when implemented, `/kontakt`.
- Other languages have a locale prefix and English page path names: `/en/contact`,
  `/ar/contact`, `/fa/contact`, `/uk/contact`, and `/ku/contact`.
- New or changed editorial slugs use Latin ASCII letters, digits, hyphens, and
  underscores. Existing saved slugs remain valid when unchanged. Public path
  segments use Latin ASCII characters. Arabic and Cyrillic characters
  are technically supported through URL encoding, but Latin paths are the agreed
  project convention. Editorial titles keep their original script.
- Identify the same page internally with one stable route key, such as `contact`.
  Map that key to `kontakt` for German and `contact` for other languages. Do not
  derive a route by translating its navigation label.
- Language switching resolves the same page through the route mapping and keeps
  its query and anchor. Switching from `/kontakt` to Arabic should lead to
  `/ar/contact`; switching back should return to `/kontakt`.
- Links, previews, canonical URLs, and language alternates must all use the same
  route resolution. Existing published URLs that change need permanent redirects.
  Continue redirecting legacy `/de` paths to their unprefixed German equivalent.
- Content-record slugs are separate from interface labels. Keep existing slugs
  stable; changes to a record's public URL require explicit handling and redirects.

The contact paths above describe the approved convention, not an existing contact
page. The current footer links to the old website's contact page. The central route map already resolves `contact` to these paths; adding the
actual local contact page remains separate work. Implemented poem and poet routes
use `/gedichte` and `/poeten` in German, and `/ar/poems` and `/ar/poets`, for
example, in Arabic. Old `/poems`, `/poets`, and corresponding `/de` URLs redirect
permanently to their German canonical paths. Workshops keep `/workshops`.

## Direction and translation quality

Use central locale metadata: Arabic and Persian are RTL; German, English,
Ukrainian, and Kurmanji are LTR. Interface direction follows the effective
interface language. Content fields and embedded text follow their content
language, including when it differs from the interface.

Declare the correct `lang` and `dir` for mixed-language content and the preview
banner. Verify keyboard behavior, narrow layouts, long translations, mixed writing
directions, and English fallback. Translated wording is provisional for the
MVP/POC. Native-speaker wording review is a separate task before public launch;
it does not block the MVP implementation.

## Implementation

- **Payload UI:** `packages/cms-ui/messages/{locale}.json`, with a separate Inlang
  project in `packages/cms-ui/project.inlang`. It compiles English, German, Arabic,
  Persian, and Ukrainian. `label()` supplies Payload's localized label objects;
  `message()` resolves custom messages with an explicit interface language.
  Neither changes global request locale state. Payload's own packs handle its
  standard controls, with English fallback.
- **Website UI:** `apps/web/messages/{locale}.json`, with its own Inlang project.
  English is the base/fallback. Shared compiler options in
  `apps/web/paraglide.config.mjs` explicitly recognize unprefixed German URLs,
  independently of the English UI fallback.
- **Content:** Payload's six content locales keep `fallback: false`. Preview
  queries explicitly disable content fallback as well. No field names, collection
  slugs, block identifiers, selection values, or existing records were renamed.
- **Preview:** the authorized preview URL carries the editor's interface language.
  The draft banner reads the CMS catalog and declares that language and direction.
  The website UI follows the preview's content route. Unsupported editor languages,
  including Kurmanji, resolve to English.
- **Inputs:** native Payload text and textarea controls retain their validation
  and behavior. Localized editorial inputs declare the selected content language
  and direction. Original poems and explicit translations use their own language
  fields, so Arabic originals and English translations can share one form.
  Interface labels continue to follow the editor preference.
- **Routes:** `packages/i18n/src/index.ts` owns stable route keys and public path
  mappings. Links, previews, metadata, and language switching use `localizedPath`;
  Astro middleware resolves German paths and redirects legacy paths. Query strings,
  anchors, and content-record slugs survive language switching. Contact, privacy,
  and legal mappings establish the convention without adding local pages.

Run these commands from the repository root:

```sh
pnpm --filter @poetry/cms-ui compile
pnpm --filter @poetry/web compile:ui
pnpm check
pnpm test
pnpm lint
```

Compilation, development setup, and the owning app commands check the catalogs.
Every message requires an English source. Missing locale messages produce a visible
English-fallback warning. Generated Paraglide files are ignored and recreated by
setup, app builds, and tests; edit the JSON catalogs instead.

## Verification and remaining review

Automated checks cover English fallback in both compiler configurations, stable
saved values, disabled editorial fallback, independent editor language, ASCII slug
validation, route mappings, query/anchor preservation, and legacy redirects.
Browser tests cover all six website locales, preview authorization, language
switching, keyboard interaction, and RTL rendering.

Real signed-in Payload checks confirmed German, English, Ukrainian, Arabic, and
Persian interface preferences independently of English content. Ukrainian controls
also previewed Arabic content while retaining a Ukrainian draft banner. Arabic
editor controls were checked at a narrow viewport. Arabic poem original inputs
retained RTL while their English translation inputs retained LTR. Temporary test
accounts and draft records were removed afterward.

Native-speaker review is still pending and is required before treating the wording
as final for public launch. Payload-owned translation gaps (for example its
hardcoded “Responsive” preview control) remain framework-owned; this work does
not replace Payload's translation packs. A small client-side label adapter handles
Payload 3.90's relationship drawer accessibility label, which otherwise displays a
localized label object as `[object Object]`.

## Framework references

- [Payload interface translations](https://payloadcms.com/docs/configuration/i18n)
- [Payload content localization](https://payloadcms.com/docs/configuration/localization)
- [Inlang message catalogs](https://inlang.com/m/reootnfj/plugin-inlang-messageFormat)
- [URL character encoding](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI)
