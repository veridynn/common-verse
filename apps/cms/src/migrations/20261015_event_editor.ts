import {
  sql,
  type MigrateUpArgs,
  type MigrateDownArgs,
} from "@payloadcms/db-postgres";
import { convertLexicalToPlaintext } from "@payloadcms/richtext-lexical/plaintext";
import { plainTextToRichText } from "../utilities/plainTextToRichText";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const version of [false, true]) {
    const tableName = version ? "_events_v_locales" : "events_locales";
    const columnName = version ? "version_content" : "content";
    const table = sql.identifier(tableName);
    const column = sql.identifier(columnName);
    const schema = await db.execute(
      sql`SELECT data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ${tableName} AND column_name = ${columnName}`,
    );
    if (schema.rows[0]?.data_type === "character varying") {
      const rows = await db.execute(
        sql`SELECT id, ${column} AS content FROM ${table} WHERE ${column} IS NOT NULL`,
      );
      for (const row of rows.rows) {
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
    const events = sql.identifier(version ? "_events_v" : "events");
    const price = sql.identifier(version ? "version_price" : "price");
    await db.execute(
      sql`ALTER TABLE ${events} ADD COLUMN IF NOT EXISTS ${price} numeric`,
    );
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const version of [false, true]) {
    const table = sql.identifier(
      version ? "_events_v_locales" : "events_locales",
    );
    const column = sql.identifier(version ? "version_content" : "content");
    const rows = await db.execute(
      sql`SELECT id, ${column} AS content FROM ${table} WHERE ${column} IS NOT NULL`,
    );
    await db.execute(
      sql`ALTER TABLE ${table} ALTER COLUMN ${column} TYPE varchar USING ${column}::text`,
    );
    for (const row of rows.rows) {
      const content = convertLexicalToPlaintext({
        data: row.content as ReturnType<typeof plainTextToRichText>,
      });
      await db.execute(
        sql`UPDATE ${table} SET ${column} = ${content} WHERE id = ${row.id}`,
      );
    }
    // Keep prices on rollback so a schema downgrade cannot discard editorial data.
  }
}
