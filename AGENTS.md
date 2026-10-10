# The Poetry Project agent guide

Read the relevant upstream skill in `.agents/skills/` and the applicable section of
[`docs/project-guidance.md`](docs/project-guidance.md) before changing that domain.
Project requirements take precedence over generic skill defaults. Keep downloaded
skills unchanged; maintain project-specific rules here and in the linked guide.

## Architecture boundaries

- Astro owns public routing, rendering, layouts, SEO, and locale URLs.
- Svelte 5 owns reusable UI and interactive islands. Hydrate only interactive components.
- Payload owns editorial data, drafts, media, admin, APIs, and later ecommerce.
- Paraglide/inlang owns project UI messages stored in Git, with separate catalogs
  for Payload UI and website UI. Payload's built-in controls retain its translation
  packs; editorial content translations stay in Payload. Follow
  [translation and routing rules](docs/translations-and-routing.md).
- PostgreSQL is the only application database.
- Stripe will own payments in the later ecommerce milestone; ecommerce is currently out of scope.

Use Node.js 26 and pnpm. Keep changes small, typed, accessible, and testable. Never assume content exists in every language. Verify affected UI in both an LTR and RTL locale.

## Skill routing and maintenance

- Svelte components and modules: `svelte-code-writer`.
- UI components and theme: `shadcn-svelte`; also `web-accessibility` for interaction behavior.
- Payload models, hooks, access, queries, and persistence: `payload`.
- Unit tests: `vitest`. Browser tests remain Playwright tests in this repository.
- Public metadata and indexing: `seo`, together with the project's locale and preview rules.
- Branches and commits: `conventional-git`. In Codex, use managed worktree tools when a new worktree is needed; the skill's `.claude/worktrees/` location is not a project requirement.
- Apple-style design reviews: `apple-design` when requested or relevant to the brief. Native Apple conventions do not determine public web behavior or WCAG requirements.
- Astro APIs: use the official `astro-docs` MCP configured in `.mcp.json`, or official Astro documentation. Do not apply Astro source-monorepo contributor skills to this application.

Load only the skills and references needed for the task. Run application and
component commands in the owning workspace (`apps/web` or `apps/cms`) using pnpm;
the web component configuration is `apps/web/components.json`.

Install external skills from the repository root using
`npx skills add <owner/repo> --skill <name> -a codex -y`, without `-g`.
Commit `.agents/skills/` and `skills-lock.json` together. Review selected upstream
updates with `npx skills update <name> -p`; do not edit the lockfile by hand or
install entire skill bundles. The lockfile records sources and hashes; committed
skill files preserve the reviewed contents.
