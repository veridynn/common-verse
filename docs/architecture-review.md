# Multilingual CMS vertical-slice review

## Outcome

The first milestone is implemented as a pnpm workspace with an Astro public site, focused Svelte 5 interactivity, Payload CMS, and PostgreSQL persistence. The PostgreSQL-backed editorial workflow has been exercised end to end. Ecommerce remains deliberately absent pending review of this milestone.

## Ownership boundaries

| Concern                                                        | Owner            | Evidence                                                         |
| -------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------- |
| Public routes, server rendering, layouts, SEO, and locale URLs | Astro            | `apps/web/src/pages` and `apps/web/src/layouts/BaseLayout.astro` |
| Interactive language selection                                 | Svelte 5         | `apps/web/src/components/LanguageSwitcher.svelte`                |
| UI messages in Git                                             | Paraglide/inlang | `apps/web/messages` and `apps/web/project.inlang`                |
| Editorial models, drafts, media, preview API, and admin        | Payload          | `apps/cms/src/collections` and `apps/cms/src/payload.config.ts`  |
| Framework context and scoped content tooling                   | MCP              | `.mcp.json`, `docs/payload-mcp.example.json`, and Payload config |
| Persistence                                                    | PostgreSQL       | `compose.yml` and Payload's PostgreSQL adapter                   |
| Payments                                                       | Stripe, later    | Explicitly deferred with all ecommerce work                      |

The public site does not use React or Next.js. Next.js exists only inside the Payload application, as intended.

## Localization decisions

- Locale metadata is centralized in `packages/i18n` for German, English, Arabic, Persian, Ukrainian, and Kurmanji.
- Arabic and Persian are RTL; the other four locales are LTR. The document `lang` and `dir` attributes come from that shared metadata.
- Interface copy is compiled from repository-owned Paraglide messages.
- Workshop editorial fields use Payload localization with fallback disabled, so a missing translation is not silently presented as if translated.
- Poem originals are nonlocalized records with an explicit original language. Optional translation records carry their own language, title, text, and translator attribution.

## Editorial workflow

Workshops and poems use Payload versions and drafts. Preview links are locale-aware and carry a dedicated preview secret to Astro. Astro verifies the secret, calls a protected Payload collection endpoint, renders the draft, and emits `noindex,nofollow`. Anonymous normal API reads are limited to published content.

The seed creates a six-locale workshop, localized media alternative text, and a Persian poem with German and English translations. It can safely fill either missing prototype record without duplicating the other.

## Accessibility and SEO

The baseline includes semantic landmarks, a skip link, visible focus, labelled controls, reduced-motion handling, logical CSS properties, responsive layouts, and explicit writing direction. The localized workshop path emits canonical and alternate URLs (including `x-default`), Open Graph and Twitter metadata, robots directives, and Event structured data. Poem pages emit CreativeWork structured data and preserve the original poem's own language and direction independently of the UI locale.

## Verification

- `pnpm check`: passes across shared packages, CMS, and web.
- `pnpm lint`: passes the repository formatting gate.
- `pnpm test`: 10 Vitest tests pass, covering locale invariants, Payload schema boundaries, authenticated editorial mutations, scoped MCP capabilities, and preview authorization.
- `pnpm build`: Astro and Payload production builds pass.
- `pnpm test:e2e`: 20 Chromium tests pass across all six locales, both RTL locales, localized workshops, translation-aware `hreflang`, collection navigation, language switching, keyboard access, preview security, SEO, media, structured data, poem translations, and browser errors.
- At the milestone review, all nine original project-local skills passed the Codex skill validator. Their project-specific guidance has since moved into `AGENTS.md` and `docs/project-guidance.md`; upstream skills are maintained through `skills-lock.json`.
- The project runs on Node.js 26, following the prototype-specific runtime decision that supersedes the original Node.js 22 baseline.

The browser suite uses a deterministic mock Payload HTTP service. This validates the public integration contract without mutating a developer database.

## PostgreSQL-backed acceptance

The final infrastructure gate was completed locally with OrbStack's Docker Engine and the repository's PostgreSQL Compose service:

1. A local editor account was created in Payload and authenticated editorial mutations were verified.
2. A German workshop, localized media alternative text, and an Arabic translation were created through Payload and persisted in PostgreSQL.
3. While the workshop was still a draft, the protected Arabic preview rendered successfully with RTL layout, Arabic content and image alternative text, a draft banner, and `noindex,nofollow`.
4. Anonymous collection reads did not expose the draft, and an invalid preview secret was rejected.
5. After publication, German and Arabic public routes rendered without a preview secret. Untranslated locale routes returned 404 rather than silently falling back.
6. The published page emitted the expected canonical URL, `de`, `ar`, and `x-default` alternates, Open Graph and Twitter metadata, and Event structured data.
7. Direct database inspection confirmed the workshop, localized fields, media alternatives, and published status in PostgreSQL.
8. The seeded six-locale workshop rendered in every supported locale, and the Persian poem remained visible from an Arabic UI route with only its explicit German and English translations and translator attribution.
9. The Arabic workshop route was visually inspected in a browser and confirmed to use RTL layout with accessible navigation, locale selection, localized media text, and registration link.

This completes the agreed first milestone. Payload Ecommerce and Stripe remain out of scope until the milestone is reviewed and a separate implementation decision is made.
