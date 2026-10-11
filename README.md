# The Poetry Project

Multilingual editorial prototype using Astro, Svelte 5, Paraglide, Payload, and PostgreSQL. Ecommerce is deferred.

## Development

Requires pnpm 12 and a running Docker Engine with Compose v2. pnpm selects
Node.js 26.10.0 automatically.

```sh
pnpm dev
```

Startup installs locked dependencies, creates local configuration once, waits for
PostgreSQL, seeds an empty local database, and starts both apps. Existing secrets
and editorial content are preserved.

`pnpm dev:setup` prepares without launching apps. Use `--no-seed` to skip demo
content or `--external-db` to use your configured database without Compose or
automatic seeding. [Startup](docs/development.md) and [configuration](docs/configuration.md).

Site: `http://localhost:4321`. Admin: `http://localhost:3001/admin`;
create the first account there. Optional larger demo dataset:
`pnpm --filter @poetry/cms seed:bulk` adds 300 poems, 100 workshops, and supporting
content to the local database. See [bulk seed details](docs/demo-data.md#optional-bulk-demo-data).
Optional event photos (free, no API key): `pnpm --filter @poetry/cms seed:photos`.
Ports 4321, 3001, and 5432 must be available.
The database and uploads are local data and are not transferred by cloning.

## Checks

`pnpm check`, `pnpm test`, `pnpm lint`, and `pnpm build`.
For browser tests, run `pnpm exec playwright install chromium` once, then
`pnpm test:e2e` with development servers stopped. The browser suite uses a mock CMS.

## Documentation

[Documentation index](docs/README.md) — Topic guides for architecture, content,
languages, UI, development, and maintenance.

[Agent guide](AGENTS.md) — Instructions for working in this repository.

For deployment, set environment-specific secrets and database credentials in the
hosting platform. Keep them stable across deploys; do not reuse local secrets.
