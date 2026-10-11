# Agents

[The Poetry Project e.V.](https://thepoetryproject.de/ueber-uns/der-verein) is a
German nonprofit association supporting young refugees and migrants through
poetry and autobiographical writing. Its workshops, public readings, and
publications promote education, self-expression, and intercultural dialogue.
This repository builds its multilingual website, presenting poetry, events,
and ways to participate.

`apps/web` uses Astro with Svelte UI components; `apps/cms` uses Payload CMS.
UI translations use Paraglide/inlang; editorial translations are stored in Payload.

## Before changing code

- Read the app guide: [web](apps/web/AGENTS.md) or [CMS](apps/cms/AGENTS.md).
  For changes spanning both apps, read both.
- Use the [documentation index](docs/README.md) to read the topics relevant to
  the change.
- Use the matching upstream skill in `.agents/skills/`. Project requirements
  take precedence over skill defaults. Preserve unrelated user edits.

## Shared contracts

- Build public pages in Astro, reusable UI in Svelte, and editorial models and
  permissions in Payload. Next.js and React serve the CMS, not the public site.
- Reuse `@poetry/i18n` for locales, writing direction, and public URL mappings.
  Update `@poetry/types` when changing the data contract between CMS and website.
- Keep website UI messages in `apps/web/messages` and custom CMS UI messages in
  `packages/cms-ui/messages`. Translate displayed labels, not stored identifiers.
- Preserve existing database records, uploads, and stable identifiers when changing
  editorial models or persistence.

## Verification

- Match checks to the affected behavior using
  [testing guidance](docs/testing.md). Report checks
  performed and any remaining gaps.
- Use pnpm package scripts so required translation catalogs compile before checks,
  tests, and builds. For startup or environment changes, read
  [development](docs/development.md).

Before installing or updating skills, or creating worktrees, read
[skill maintenance and project overrides](docs/skills.md).
