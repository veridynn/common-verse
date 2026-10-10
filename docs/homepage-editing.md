# Homepage editing

The homepage is a Payload global under **Website → Homepage**. Astro renders the
public homepage and its preview using the same components. Ordinary public pages
remain server rendered; the preview bridge is active only on authorised previews.

German lives at `/`; other languages keep their locale prefix. Visitors can choose
Light, Dark, or System appearance in the header. Colour and UI foundations are
documented in [design-tokens.md](design-tokens.md).

Your Payload interface language is your account's preferred language for editor
controls. It is independent of the content language selected for editing: you can
use Ukrainian controls while editing English content. English is the agreed UI
default/fallback, including for unsupported Kurmanji editor UI. Website Kurmanji
content and UI remain supported. Project-defined editor labels still need the
translation work described in
[translations-and-routing.md](translations-and-routing.md).

## Editorial controls

- **Hero:** choose a poem, workshop/event, or project announcement.
  The headline and short introduction are translated independently. Poems keep
  their original language and show a translation only when one actually exists.
- **Featured:** add a promotion anywhere in the section order. Choose a poem,
  poet, or event/workshop, then give the section a translated title and short
  introduction. The selected record supplies its own image, title, description,
  and destination; editing that record updates the promotion too. Poems use their
  media and original verse, plus an explicit translation when one exists. Articles are available in their own collection and public archive.
- **Mission:** the project introduction. Edit its heading, text, image, link,
  and position. It can be removed or repeated like the other sections.
- **Events:** events and workshops share one picker. Automatic shows up to
  four nearest upcoming published records. Manual shows only the selected records,
  in the chosen order, up to four. Past events, drafts, duplicates, and records
  without a title in the current language are omitted. Events underway remain
  listed until their end time. Dates use Europe/Berlin time.
- **Poems:** Automatic shows the four newest published poems by creation date.
  Manual shows only the chosen poems, up to four and in selection order. Originals
  remain visible; only available translations appear alongside them.
- **Poets:** Automatic shows the four newest profiles with at least one published
  poem. Manual shows only the chosen profiles, up to four and in selection order.
  Names are shared; biographies and image descriptions are localised.
- **Take part:** edit up to three destinations and their translated labels and
  descriptions. Root-relative links automatically use the visitor's locale.
- **Newsletter:** edit its heading, text, and signup destination. Signup opens the
  configured newsletter service; this site does not pretend to collect emails.
- **Search and social sharing:** edit the localised title, description, and image.

Mission retains its existing `introduction` block identifier to preserve saved
content. Existing selections and participation links remain available; no seed
command overwrites an existing homepage.

Sections can be removed or repeated; those with a visibility toggle can also be
hidden. Order, relationships,
dates, and visibility are shared between languages; editorial prose is localised.
Payload language fallback is disabled. Missing prose uses the translated base UI
copy, never another language's editorial text. Images without an accessible
description in the current language are omitted.

## Drafts and Live Preview

Configure the same `PREVIEW_SECRET` in the CMS and Astro runtime, and correct
`PUBLIC_SITE_URL` / `PUBLIC_CMS_URL` origins. Open Live Preview and select a mobile,
tablet, desktop, or responsive width. The preview refreshes after autosave, draft
save, and publish. It verifies the CMS message origin and preserves scroll position.
The draft-preview banner must follow the editor's Payload interface language,
independently of the content language being previewed. Direct preview links without
an editor language use English for the banner. Preview URLs already pass an editor
language, but the signed-in account flow still needs verification; the translation
guide records the remaining work.

For local preview, use the same hostname for both applications (for example,
`localhost:3001` and `localhost:4321`). Chromium's local-network protection can
block an iframe when one application uses `127.0.0.1` and the other uses `localhost`.

Save a draft to review changes privately; publish to make them public. The editor,
mutations, and version history require authentication. Anonymous homepage reads
use the published global and exclude populated draft relationships. Preview
requests require the preview secret, use `no-store`, suppress referrers, and emit
`noindex,nofollow`. Treat preview links as credentials, as documented in
[development.md](development.md).

## Local initialisation

Run `pnpm seed:homepage` in `apps/cms` with PostgreSQL available. It creates the
homepage only if no saved homepage exists, using existing published records and
the six translated starting texts. It never replaces an existing homepage.
Review the initial content before using it outside the local prototype.

Invitation, support, and newsletter links initially point to the existing Poetry
Project website. Editors can replace these homepage section destinations. The footer
links to the local About, Contact, Privacy, and Legal Notice routes. Each has its own
fixed Payload editor under Pages. Supply and publish the title and rich text content (paragraphs, headings, bold/italic, lists and links)
for each language. Missing or incomplete translations use English on these four
fixed pages; other editorial content retains its existing translation behavior. The legacy
generic page collection is hidden and its records are preserved.

The local development database uses Payload's schema push. As with the existing
collections, production rollout requires a reviewed Payload migration; running
the local seed is not a deployment command.

## Fixed informational page starting content

Run `pnpm seed:pages` in `apps/cms` to import the German and English
About, Contact, Privacy, and Legal Notice content. This replaces those two locales
for the four globals in one transaction and preserves other translations. Existing
versions retain the previous content. The command refuses production.

The adaptations were prepared from [About](https://thepoetryproject.de/ueber-uns),
[Association](https://thepoetryproject.de/ueber-uns/der-verein),
[Contact](https://thepoetryproject.de/kontakt),
[Privacy](https://thepoetryproject.de/datenschutz), and
[Legal Notice](https://thepoetryproject.de/impressum), retrieved on 10 October 2026.
Names, organization identifiers, addresses and contact details use placeholders.
Privacy describes the starting content and needs to match the services used by the
website. Replace placeholders and review
privacy/legal content before public launch. No old photographs are imported.

The meta-description helper explains its use in search results and link previews;
it is not part of the visible page text. Existing fixed-page text and saved versions
are converted by `20261010_fixed_page_rich_text`. Run `pnpm payload migrate`
with schema push disabled (`PAYLOAD_MIGRATING=true`) before starting an older
development database with this schema. Rolling this migration back preserves text
but removes rich-text formatting.
