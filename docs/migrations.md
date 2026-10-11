# Migrations and local data

Development uses Payload's schema push; production schema changes require
reviewed Payload migrations in `apps/cms/src/migrations`. Running a local seed
is not a deployment command. Preserve records, stored identifiers, versions,
and relationships when changing the schema.

## Existing database upgrades

Before a production upgrade, run the Payload migration
`20261010_blog_posts` after the existing migrations to create the article tables,
localized content and draft/version storage. Development uses Payload schema push;
do not run this creation migration over tables already created by development push.

Existing fixed-page text and saved versions
are converted by `20261010_fixed_page_rich_text`. Run `pnpm --filter @poetry/cms payload migrate`
with schema push disabled (`PAYLOAD_MIGRATING=true`) before starting an older
development database with this schema. Rolling this migration back preserves text
but removes rich-text formatting.

The `20261010_editorial_names` migration renames existing collection tables,
version tables, homepage author blocks and relationships without dropping records.
It also updates stored internal links. This migration is forward-only.

## Preserving local data

Database content, users, and uploads are local data; cloning Git does not transfer
them. Back up PostgreSQL and `apps/cms/media/` together when transferring content.
`docker compose down --volumes` deletes database data; ordinary startup never does.

Verify migrations and changes to transaction behavior against real PostgreSQL;
mocked application tests do not prove database behavior. See [testing](testing.md).
