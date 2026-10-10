import {
  sql,
  type MigrateUpArgs,
  type MigrateDownArgs,
} from "@payloadcms/db-postgres";
import { convertLexicalToPlaintext } from "@payloadcms/richtext-lexical/plaintext";
import { fixedPageKeys } from "@poetry/i18n";
import { plainTextToRichText } from "../utilities/plainTextToRichText";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const page of fixedPageKeys) {
    for (const version of [false, true]) {
      const tableName = version ? `_${page}_v_locales` : `${page}_locales`;
      const columnName = version ? "version_content" : "content";
      const table = sql.identifier(tableName);
      const column = sql.identifier(columnName);
      const schema = await db.execute(
        sql`SELECT data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ${tableName} AND column_name = ${columnName}`,
      );
      // Fresh installs already have JSONB; convert every locale and saved version on upgrades.
      if (schema.rows[0]?.data_type !== "character varying") continue;
      const result = await db.execute(
        sql`SELECT id, ${column} AS content FROM ${table} WHERE ${column} IS NOT NULL`,
      );
      for (const row of result.rows) {
        const content = JSON.stringify(
          plainTextToRichText(row.content as string),
        );
        await db.execute(
          sql`UPDATE ${table} SET ${column} = ${content} WHERE id = ${row.id}`,
        );
      }
      await db.execute(
        sql`ALTER TABLE ${table} ALTER COLUMN ${column} TYPE jsonb USING ${column}::jsonb`,
      );
    }
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const page of fixedPageKeys) {
    for (const version of [false, true]) {
      const table = sql.identifier(
        version ? `_${page}_v_locales` : `${page}_locales`,
      );
      const column = sql.identifier(version ? "version_content" : "content");
      const result = await db.execute(
        sql`SELECT id, ${column} AS content FROM ${table} WHERE ${column} IS NOT NULL`,
      );
      await db.execute(
        sql`ALTER TABLE ${table} ALTER COLUMN ${column} TYPE varchar USING ${column}::text`,
      );
      for (const row of result.rows) {
        const content = convertLexicalToPlaintext({
          data: row.content as ReturnType<typeof plainTextToRichText>,
        });
        await db.execute(
          sql`UPDATE ${table} SET ${column} = ${content} WHERE id = ${row.id}`,
        );
      }
    }
  }
}
