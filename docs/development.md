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
Create the first account in the admin UI; the seed never creates credentials.
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

Sanitized production snapshots and optional bulk Faker data are later milestones.
A populated imported database will already bypass automatic demo seeding.

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
