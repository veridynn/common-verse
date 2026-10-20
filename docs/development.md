# Development startup

Run `pnpm dev` from the repository root. Install the pnpm version pinned in
`package.json` and start Docker Engine with Compose v2. pnpm downloads the Node
version configured in `devEngines.runtime`; no manual Node switching is needed.

## What happens and why

| Step                                                          | Purpose                                                                          |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Validate configuration and application ports                  | Fail early with an actionable error.                                             |
| Install with `--frozen-lockfile`                              | Handle fresh clones and dependency changes without modifying the lockfile.       |
| Create `.env` only when absent                                | Give a new clone local settings and independent random secrets.                  |
| Start PostgreSQL/PostGIS and wait up to 60 seconds for health | Ensure Payload can connect before seeding or starting apps.                      |
| Seed only an empty local editorial database                   | Show useful multilingual examples without changing imported or existing content. |
| Generate CMS types                                            | Supply generated files missing from a fresh clone.                               |
| Supervise Astro and Next in the foreground                    | Start together and stop both apps on Ctrl+C or an app failure.                   |

The scripts use Node built-ins and can run before application dependencies exist.
The first start needs downloads for runtimes, packages, and the PostgreSQL image.
Later starts reuse caches. Startup never deletes a database volume or runs a
production migration.

`pnpm dev:setup` performs preparation only. Both commands accept `--no-seed` and
`--external-db`. The latter skips Compose and automatic seeding, and requires you
to provision your configured database. A database URL different from the Compose
default requires this explicit option. After setup, the existing `dev:web` and
`dev:cms` commands remain available for individual application development.

The database image includes PostGIS for Payload native Point fields. The official
image runs as `linux/amd64`, including Docker emulation on Apple Silicon. The PostgreSQL
17 data volume is reused across container restarts.

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

Environment variables and secret handling are in
[configuration](configuration.md); optional seed procedures are in
[demo data](demo-data.md). Choose checks using [testing guidance](testing.md).

## Dependency and platform checks

A mismatched lockfile fails startup. After an intentional dependency change, run
`pnpm install` and commit the manifests and lockfile. Docker must be running and
accessible to your user. Fresh-copy startup, repeat startup, PostgreSQL rollback,
and browser tests have passed on macOS. Startup unit tests also pass on Linux;
full Linux and Windows startup remain unverified.
