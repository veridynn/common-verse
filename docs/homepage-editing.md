# Homepage editing

The homepage is a Payload global under **Website → Homepage**. Astro renders the
public homepage and its preview using the same components. Ordinary public pages
remain server rendered; the preview bridge is active only on authorised previews.

German lives at `/`; other languages keep their locale prefix. Visitors can choose
Light, Dark, or System appearance in the header. Colour and UI foundations are
documented in [design-tokens.md](design-tokens.md).

## Editorial controls

- **Opening feature:** choose a poem, workshop/event, or project announcement.
  The headline and short introduction are translated independently. Poems keep
  their original language and show a translation only when one actually exists.
- **Project introduction:** exactly one is required for publication. Its heading,
  text, image, link, and position are editable.
- **Featured poets:** select up to four profiles in order. An empty selection uses
  the latest profiles. Names are shared; biographies and image descriptions are
  localised. Profiles link to their own public pages and published poems.
- **Upcoming events and workshops:** automatic dates come from published workshop
  records. Set their type to Workshop or Reading/event. Optional pins appear
  first; duplicate, past, untranslated, and draft events are excluded. An event
  underway remains listed until its end time. Dates use Europe/Berlin time.
- **Take part:** edit up to three destinations and their translated labels and
  descriptions. Root-relative links automatically use the visitor's locale.
- **Newsletter:** edit its heading, text, and signup destination. Signup opens the
  configured newsletter service; this site does not pretend to collect emails.
- **Search and social sharing:** edit the localised title, description, and image.

Optional sections can be hidden, removed, or repeated. Order, relationships,
dates, and visibility are shared between languages; editorial prose is localised.
Payload language fallback is disabled. Missing prose uses the translated base UI
copy, never another language's editorial text. Images without an accessible
description in the current language are omitted.

## Drafts and Live Preview

Configure the same `PREVIEW_SECRET` in the CMS and Astro runtime, and correct
`PUBLIC_SITE_URL` / `PUBLIC_CMS_URL` origins. Open Live Preview and select a mobile,
tablet, desktop, or responsive width. The preview refreshes after autosave, draft
save, and publish. It verifies the CMS message origin and preserves scroll position.

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

Invitation, support, newsletter, and footer legal/contact links initially point
to the existing Poetry Project website. Editors can replace the homepage section
destinations as the remaining pages are migrated. The footer destinations stay in
the public layout until those routes are implemented.

The local development database uses Payload's schema push. As with the existing
collections, production rollout requires a reviewed Payload migration; running
the local seed is not a deployment command.
