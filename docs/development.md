# Development startup

Run `pnpm dev` from the repository root. Prerequisites are pnpm 12 and a running
Docker Engine with Compose v2. The project pins pnpm 12.3.4 and downloads Node
26.10.0 through `devEngines.runtime`; no manual Node switching is needed.

## What happens and why

| Step                                                  | Purpose                                                                          |
| ----------------------------------------------------- | -------------------------------------------------------------------------------- |
| Validate configuration and application ports          | Fail early with an actionable error.                                             |
| Install with `--frozen-lockfile`                      | Handle fresh clones and dependency changes without modifying the lockfile.       |
| Create `.env` only when absent                        | Give a new clone local settings and independent random secrets.                  |
| Start PostgreSQL and wait up to 60 seconds for health | Ensure Payload can connect before seeding or starting apps.                      |
| Seed only an empty local editorial database           | Show useful multilingual examples without changing imported or existing content. |
| Generate CMS types                                    | Supply generated files missing from a fresh clone.                               |
| Supervise Astro and Next in the foreground            | Start together and stop both apps on Ctrl+C or an app failure.                   |

The scripts use Node built-ins and can run before application dependencies exist.
The first start needs downloads for runtimes, packages, and the PostgreSQL image.
Later starts reuse caches. Startup never deletes a database volume or runs a
production migration.

`pnpm dev:setup` performs preparation only. Both commands accept `--no-seed` and
`--external-db`. The latter skips Compose and automatic seeding, and requires you
to provision your configured database. A database URL different from the Compose
default requires this explicit option. After setup, the existing `dev:web` and
`dev:cms` commands remain available for individual application development.

Site: `http://localhost:4321`. Admin: `http://localhost:3001/admin`.
`pnpm dev:force` stops this checkout's servers on ports 4321 and 3001 before
starting again (macOS/Linux, requires `lsof`). Services from other projects are
left running and produce an error. It is also available in Zed's task picker.
Create the first account in the admin UI; it becomes the Administrator. The
administrator creates Editor accounts for content managers. The seed never creates
credentials. See [accounts and permissions](accounts-and-permissions.md) for the
MVP role rules and the v2.0 contributor plan.
Ctrl+C stops the apps. `docker compose stop postgres` stops the database while
retaining data. Ports 4321 and 3001 must be free; Compose needs local port 5432.

## Secrets: local development versus deployment

When `.env` is absent, setup copies `.env.example` and replaces its secret
placeholders with two independent 32-byte cryptographically random values. The
file is created with owner-only permissions where supported and excluded from Git.
It is plain text, not encrypted. Restrict access to your development machine.

Existing `.env` files are preserved byte for byte. Missing or placeholder required
values produce an error; correct them explicitly. Shell environment variables take
precedence. Both applications use the root file; a second CMS `.env` is not needed.
Development setup refuses to run with `NODE_ENV=production`.

Production secrets must be generated separately, stored in your hosting platform's
secret settings, and kept stable across deployments. Neither builds nor production
startup should generate them. Rotating Payload's secret can invalidate sessions;
rotating the preview secret invalidates previously issued preview links.

| Variable                    | Deployment owner and timing                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `PAYLOAD_SECRET`            | CMS runtime; private and stable.                                                                                         |
| `PREVIEW_SECRET`            | Same private value in CMS and Astro runtimes. Astro reads it through `astro:env/server`, not an embedded build constant. |
| `DATABASE_URL`              | CMS runtime; actual environment database credentials.                                                                    |
| `PUBLIC_CMS_URL`            | Astro build; the CMS origin reachable by the Astro server.                                                               |
| `PUBLIC_SITE_URL`           | Astro build and CMS runtime; the public site origin for metadata and preview links.                                      |
| `PAYLOAD_PUBLIC_SERVER_URL` | CMS runtime; the public CMS origin.                                                                                      |

No secret should receive a `PUBLIC_` prefix. Preview links contain a bearer secret;
share them only with intended reviewers. Development setup is not a deployment
command. Production schema changes need reviewed Payload migrations.

## Demo data and future snapshots

Development seed tooling, fixtures, artwork, and tests live in
`apps/cms/scripts/seed/`, separate from application source in `apps/cms/src/`.
The CLI imports the real Payload configuration so generated records follow the
same schema and validation as editorial content. Application code does not import
seed tooling; Faker and the script runner remain development dependencies.

The curated TypeScript seed uses Payload's Local API to create one six-language
workshop, artwork with localized alternative text, and a Persian poem with explicit
German and English translations. Automatic seeding checks authors, media, pages,
poems, and workshops and skips the database if any contain records. User accounts
are excluded from this emptiness check.

All writes share one PostgreSQL transaction. A failure rolls back records and
removes only files belonging to that attempt. Existing editorial files and records
are preserved. Avoid simultaneous first-time setup against the same database.
You can explicitly run `pnpm --filter @poetry/cms seed` to fill missing demo records;
it does not update existing records or repair an older partial translation set.

Database content, users, and uploads are local data; cloning Git does not transfer
them. Back up PostgreSQL and `apps/cms/media/` together when transferring content.
`docker compose down --volumes` deletes database data; ordinary startup never does.

### Optional bulk demo data

Run `pnpm --filter @poetry/cms seed:bulk` from the repository root to add 60
fictional authors, 300 poems, 100 workshops, and 12 local SVG
artwork assets. Start PostgreSQL first with `docker compose up -d postgres`.
This separate command does not change the small automatic startup seed.

The bulk command only accepts a local `poetry` database and refuses production.
It writes through Payload in one transaction, rolls back on failure, and removes
only uploads from the failed attempt. Repeat runs skip existing demo records,
including drafts, without updating or deleting editorial content. Do not run seeds
concurrently. Keep the `bulk-demo-v1` identifiers in demo names, slugs, and artwork
credits if you want later runs to recognize those records.

Faker supplies localized fictional names and fixed-range workshop dates. Its
version and random seeds are pinned. Six-language editorial fixtures supply
matching demo poem translations and workshop prose; they are illustrative writing,
not real poems or reviewed publication translations. Some poems have no
translations, others have up to five. Workshop, page, and biography translations
are intentionally incomplete in some records. One in five poems and workshops is
a draft; text lengths, artwork relationships, and past/future dates vary. Workshops
are marked `noIndex` and omit registration links. No users or credentials are seeded.

### Optional event photographs (no API key)

Run `pnpm --filter @poetry/cms seed:photos` to prepare the bulk dataset and import
12 JPEG photographs of poetry events from Wikimedia Commons' public API. This
free service requires no API key. Pexels was considered but new API key issuance
was unavailable. The ordinary startup and `seed:bulk` commands remain offline
with respect to image services.

The importer searches for poetry readings, selects a repeatable sample, and
accepts only photos with an author, source page, and CC BY or CC BY-SA license.
It saves source title, photographer, license, source link, license link, and a
resizing/cropping notice in each media credit. Credits remain stored in CMS media metadata. Localized alternative text describes its illustrative purpose.

The command upgrades only seed artwork on bulk demo workshops, keeps intentionally
image-free fixtures, and preserves editor-chosen images and draft/published status.
Downloaded originals and Payload-generated sizes live in `apps/cms/media/`.
Repeat runs reuse the cached 12 media records without image API requests; do not
rename their `bulk-demo-v1-commons-photo-*` filenames. API failures stop the photo
import rather than silently changing images. Database writes share a transaction;
a failure rolls back attachments and removes only that attempt's files. Photo
imports and the preceding bulk dataset preparation are separate transactions.

Sanitized production snapshots remain a later milestone. A populated imported
database already bypasses automatic demo seeding.

## Checks and verification

Run `pnpm test`, `pnpm check`, `pnpm lint`, and `pnpm build` after implementation
changes. Browser tests need Chromium installed once with
`pnpm exec playwright install chromium` (Linux may additionally need Playwright's
OS dependencies). Stop development servers before `pnpm test:e2e`; the suite owns
its mock CMS and server ports and deliberately uses different build/runtime
preview secrets.

A mismatched lockfile fails startup. After an intentional dependency change, run
`pnpm install` and commit the manifests and lockfile. Docker must be running and
accessible to your user. Fresh-copy startup, repeat startup, PostgreSQL rollback,
and browser tests have passed on macOS. Startup unit tests also pass on Linux;
full Linux and Windows startup remain unverified.

### Generated profile portraits

Public poet cards and profile pages use DiceBear Open Peeps with the Bold Pop
preset. A missing portrait is generated locally from the person’s ID; the same ID
produces the same illustration across locales and pages. Uploaded editorial
portraits take precedence. Earlier imported demo portrait photos are replaced in
the public UI by illustrations; their media records remain intact. No external
avatar API calls, browser JavaScript, or portrait-photo seed step is needed.
