# The Poetry Project

Multilingual editorial prototype built with Astro, Svelte 5, Paraglide, Payload, and PostgreSQL.

## Local development

1. Use Node.js 26 and pnpm.
2. Copy `.env.example` to `.env` and replace the secrets. Both apps load this root file.
3. Start PostgreSQL with `docker compose up -d postgres`.
4. Run `pnpm install`.
5. Run `pnpm --filter @poetry/cms seed` to create the six-language workshop and multilingual poem used by the prototype.
6. Run `pnpm dev`.

The public site runs at `http://localhost:4321`; Payload admin runs at `http://localhost:3001/admin`.

## Commands

- `pnpm dev` — run the web and CMS apps
- `pnpm build` — build all packages and apps
- `pnpm check` — type/framework checks
- `pnpm test` — unit tests
- `pnpm test:e2e` — Playwright smoke tests
- `pnpm --filter @poetry/cms seed` — idempotently create prototype editorial content
- `pnpm --filter @poetry/cms payload migrate:create` — create a Payload migration
- `pnpm --filter @poetry/cms payload migrate` — run Payload migrations

The first milestone intentionally excludes ecommerce.

Playwright starts a small mock Payload HTTP server, so routing, preview authorization, SEO, RTL, and accessibility smoke tests are deterministic without changing the development database. The real editor-to-database flow still uses Payload and PostgreSQL through Compose.

## Agent documentation and content tools

Project rules live in [AGENTS.md](AGENTS.md) and the task-specific sections of
[the implementation guide](docs/project-guidance.md). `.agents/skills/` contains
upstream skills installed for this project with `npx skills add`; their sources
and hashes are recorded in `skills-lock.json`. Keep the installed copies and
lockfile in the same commit. See `AGENTS.md` for skill routing and update commands.

The checked-in `.mcp.json` connects compatible development agents to Astro's official documentation server. The official Payload MCP plugin exposes the local content endpoint at `http://localhost:3001/api/mcp`; start Payload, create a scoped key under **Payload MCP API Keys** in the admin, and adapt `docs/payload-mcp.example.json` in your personal MCP client configuration. Never commit the key. User accounts are not exposed through MCP, and destructive content deletion is disabled.

See [the architecture review](docs/architecture-review.md) for the milestone boundaries, verification evidence, and the required real-PostgreSQL acceptance pass before ecommerce begins.

See [the accessible UI library research](docs/ui-library-research.md) for component options and recommendations.
