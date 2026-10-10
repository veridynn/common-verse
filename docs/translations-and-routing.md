# Translations and language routing

This document records the agreed translation rules and the remaining implementation
work. These rules are project requirements; the implementation status below does
not imply that every rule is already implemented.

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
- Public path segments use Latin ASCII characters. Arabic and Cyrillic characters
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
page. The current footer links to the old website's contact page. The current
`localizedPath` helper adds locale prefixes but does not translate page segments;
it needs route-mapping support before `/kontakt` and `/ar/contact` can represent
the same local page.

## Direction and translation quality

Use central locale metadata: Arabic and Persian are RTL; German, English,
Ukrainian, and Kurmanji are LTR. Interface direction follows the effective
interface language. Content fields and embedded text follow their content
language, including when it differs from the interface.

Declare the correct `lang` and `dir` for mixed-language content and the preview
banner. Verify keyboard behavior, narrow layouts, long translations, mixed writing
directions, and English fallback. Have native speakers review translations before
treating them as finished.

## Implementation status and plan

At the time of this agreement:

- Website UI already uses Paraglide/inlang, but its configured base locale is
  German. English UI fallback still needs implementation and verification.
- Payload's built-in interface languages are German, English, Arabic, Persian,
  and Ukrainian. Many project-defined labels and descriptions are still English
  literals, or are inferred from untranslated field names.
- Editorial localization supports all six languages and disables fallback.
- Preview URLs pass an `editorLanguage` parameter, and the banner can use it.
  The banner message currently belongs to the website catalog. A supplied
  screenshot still showed English with Arabic editor controls; the real account
  preference and preview flow need verification before calling that integration
  complete.
- German routes are unprefixed, and other routes have locale prefixes. German
  page-name mappings are not yet implemented.

Implement the agreed rules in this order:

1. Create a dedicated CMS Paraglide/inlang project, separate from the website
   catalog. Compile it for the CMS and expose only the editor messages needed by
   previews. Reuse the existing locale metadata and translation toolchain.
2. Inventory and translate all project-defined CMS labels, groups, descriptions,
   placeholders, options, custom components, and user-facing validation messages.
   Give inferred labels explicit translations. Preserve stored identifiers.
3. Resolve custom UI text from Payload's interface preference on both server and
   client. Use English default/fallback and keep the content selector independent.
   Move the draft banner to the CMS catalog and verify the signed-in preview flow.
4. Set English UI fallback for the website without changing German default routes
   or enabling editorial fallback. Keep Kurmanji editor UI on English fallback.
5. Add explicit public route mappings and update links, language switching,
   previews, metadata, and redirects together as mapped pages are implemented.
6. Test UI fallback, language independence, stable saved values, and mapped URLs.
   Verify LTR/RTL and the real editor workflow as well as mock browser tests. Record
   native-speaker review separately from technical test results.

## Framework references

- [Payload interface translations](https://payloadcms.com/docs/configuration/i18n)
- [Payload content localization](https://payloadcms.com/docs/configuration/localization)
- [Inlang message catalogs](https://inlang.com/m/reootnfj/plugin-inlang-messageFormat)
- [URL character encoding](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI)
