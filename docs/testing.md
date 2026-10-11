# Testing and verification

Use Vitest for deterministic logic and Playwright for observable browser behavior.
Cover the smallest critical behavior for public UI changes rather than mirroring
implementation details. Maintain smoke coverage for all six locale routes,
Arabic/Persian RTL, Kurmanji LTR, localized events, draft preview authorization,
language switching, keyboard navigation, and browser console errors.

Choose checks by what the change can affect. Run the relevant narrow test first;
broaden checks when the change crosses app/package boundaries or failures reveal
a wider impact. Use pnpm package scripts so catalog compilation is included.

| Change                                                | Verification                                                                                                                    |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| App logic or types                                    | Owning app `check`, affected Vitest tests, and formatting of changed files.                                                     |
| Shared packages or CMS response contracts             | Checks and affected tests in both consuming apps; update mock CMS fixtures when responses change.                               |
| Public rendering, routes, metadata, or hydration      | Web `check` and `build`, plus affected Playwright tests.                                                                        |
| Layouts or interactions                               | Affected browser tests; a narrow viewport in German/English and Arabic/Persian; keyboard and focus checks for changed controls. |
| Theme                                                 | Theme browser tests covering Light, Dark, System, contrast, and initial rendering without JavaScript.                           |
| CMS access, previews, or admin behavior               | Affected access/preview tests; signed-in CMS checks for changed editor workflows.                                               |
| Migrations, database queries, or transaction behavior | CMS checks and affected tests, plus verification against real PostgreSQL.                                                       |
| Startup or build configuration                        | Affected script tests and app builds; exercise the changed startup path.                                                        |
| Documentation                                         | Local link checks and Prettier on changed files.                                                                                |
| Installed skills                                      | Discovery, lockfile consistency, links, and formatting.                                                                         |

Run commands from the root using `pnpm --filter @poetry/web` or
`pnpm --filter @poetry/cms` for app scripts. Use `pnpm check` and `pnpm test` when
the impact spans the workspace. Check formatting with
`pnpm exec prettier --check <changed-files>`; `pnpm lint` checks the whole repo.

Run affected browser tests with `pnpm test:e2e tests/e2e/<file>.spec.ts`.
Stop development servers first: Playwright starts its own mock CMS and built web
server. These tests do not prove the real editor-to-database flow, which requires
PostgreSQL and both applications running.

The suite uses Chromium and includes keyboard and axe checks for selected UI.
Additional browsers, broader assistive-technology checks, and CI remain follow-up
work. Report checks actually performed and any gaps; an axe scan alone is not a
complete accessibility evaluation.

## Browser setup

Install Chromium once with `pnpm exec playwright install chromium`. Linux may
also need Playwright system dependencies. Configuration lives in
`playwright.config.ts`; browser tests are in `tests/e2e`, with mock CMS and server
fixtures in `tests/fixtures`. Build and runtime preview secrets deliberately
differ to detect secrets embedded at build time.
