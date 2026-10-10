import {
  type MigrateUpArgs,
  type MigrateDownArgs,
  sql,
} from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE FUNCTION pg_temp.editorial_url(value text) RETURNS text LANGUAGE plpgsql AS $$
    DECLARE old_name text; international text; german text;
    BEGIN
      FOREACH old_name IN ARRAY ARRAY['posts', 'blog', 'workshops', 'poets', 'poeten'] LOOP
        international := CASE WHEN old_name IN ('posts', 'blog') THEN 'articles' WHEN old_name = 'workshops' THEN 'events' ELSE 'authors' END;
        german := CASE WHEN international = 'articles' THEN 'artikel' WHEN international = 'events' THEN 'veranstaltungen' ELSE 'autoren' END;
        value := regexp_replace(value, '^/(en|ar|fa|uk|ku)/' || old_name || '([/?#]|$)', '/\\1/' || international || '\\2');
        value := regexp_replace(value, '^/(de/)?' || old_name || '([/?#]|$)', '/' || german || '\\2');
      END LOOP;
      RETURN value;
    END $$;
    CREATE FUNCTION pg_temp.editorial_json(value jsonb, field_name text DEFAULT '') RETURNS jsonb LANGUAGE plpgsql AS $$
    DECLARE item record; result jsonb;
    BEGIN
      IF jsonb_typeof(value) = 'object' THEN
        result := '{}'::jsonb;
        FOR item IN SELECT * FROM jsonb_each(value) LOOP
          result := result || jsonb_build_object(CASE WHEN item.key = 'poets' THEN 'authors' ELSE item.key END, pg_temp.editorial_json(item.value, item.key));
        END LOOP;
        RETURN result;
      ELSIF jsonb_typeof(value) = 'array' THEN
        SELECT coalesce(jsonb_agg(pg_temp.editorial_json(element, field_name)), '[]'::jsonb) INTO result FROM jsonb_array_elements(value) AS element;
        RETURN result;
      ELSIF jsonb_typeof(value) = 'string' THEN
        IF field_name IN ('url', 'href', 'linkUrl', 'link_url') THEN
          RETURN to_jsonb(pg_temp.editorial_url(value #>> '{}'));
        ELSIF field_name IN ('blockType', 'relationTo') THEN
          RETURN to_jsonb(replace(replace(replace(value #>> '{}', 'posts', 'articles'), 'workshops', 'events'), 'poets', 'authors'));
        END IF;
      END IF;
      RETURN value;
    END $$;
    DO $$
    DECLARE item record; renamed text;
    BEGIN
      FOR item IN SELECT typname FROM pg_type JOIN pg_namespace n ON n.oid = typnamespace WHERE n.nspname = current_schema() AND typtype = 'e' AND typname ~ '(posts|workshops|poets)' LOOP
        renamed := replace(replace(replace(item.typname, 'posts', 'articles'), 'workshops', 'events'), 'poets', 'authors');
        EXECUTE format('ALTER TYPE %I.%I RENAME TO %I', current_schema(), item.typname, renamed);
      END LOOP;
      FOR item IN SELECT tablename FROM pg_tables WHERE schemaname = current_schema() AND tablename ~ '(posts|workshops|poets)' LOOP
        renamed := replace(replace(replace(item.tablename, 'posts', 'articles'), 'workshops', 'events'), 'poets', 'authors');
        EXECUTE format('ALTER TABLE %I.%I RENAME TO %I', current_schema(), item.tablename, renamed);
      END LOOP;
      FOR item IN SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = current_schema() AND column_name ~ '(posts|workshops|poets)' LOOP
        renamed := replace(replace(replace(item.column_name, 'posts', 'articles'), 'workshops', 'events'), 'poets', 'authors');
        EXECUTE format('ALTER TABLE %I.%I RENAME COLUMN %I TO %I', current_schema(), item.table_name, item.column_name, renamed);
      END LOOP;
      FOR item IN SELECT c.relname AS table_name, conname FROM pg_constraint JOIN pg_class c ON c.oid = conrelid JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = current_schema() AND conname ~ '(posts|workshops|poets)' LOOP
        renamed := replace(replace(replace(item.conname, 'posts', 'articles'), 'workshops', 'events'), 'poets', 'authors');
        EXECUTE format('ALTER TABLE %I.%I RENAME CONSTRAINT %I TO %I', current_schema(), item.table_name, item.conname, renamed);
      END LOOP;
      FOR item IN SELECT indexname FROM pg_indexes WHERE schemaname = current_schema() AND indexname ~ '(posts|workshops|poets)' LOOP
        renamed := replace(replace(replace(item.indexname, 'posts', 'articles'), 'workshops', 'events'), 'poets', 'authors');
        EXECUTE format('ALTER INDEX %I.%I RENAME TO %I', current_schema(), item.indexname, renamed);
      END LOOP;
      FOR item IN SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = current_schema() AND sequence_name ~ '(posts|workshops|poets)' LOOP
        renamed := replace(replace(replace(item.sequence_name, 'posts', 'articles'), 'workshops', 'events'), 'poets', 'authors');
        EXECUTE format('ALTER SEQUENCE %I.%I RENAME TO %I', current_schema(), item.sequence_name, renamed);
      END LOOP;
      FOR item IN SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = current_schema() AND column_name IN ('path', '_path') LOOP
        EXECUTE format('UPDATE %I.%I SET %I = replace(replace(replace(%I, ''poets'', ''authors''), ''workshops'', ''events''), ''posts'', ''articles'') WHERE %I ~ ''(poets|workshops|posts)''', current_schema(), item.table_name, item.column_name, item.column_name, item.column_name);
      END LOOP;
      FOR item IN SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = current_schema() AND (column_name LIKE '%link_url' OR column_name = 'url') AND data_type IN ('text', 'character varying') LOOP
        EXECUTE format('UPDATE %I.%I SET %I = pg_temp.editorial_url(%I) WHERE %I ~ ''(posts|blog|workshops|poets|poeten)''', current_schema(), item.table_name, item.column_name, item.column_name, item.column_name);
      END LOOP;
      FOR item IN SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = current_schema() AND data_type = 'jsonb' LOOP
        EXECUTE format('UPDATE %I.%I SET %I = pg_temp.editorial_json(%I) WHERE %I::text ~ ''(posts|blog|workshops|poets|poeten)''', current_schema(), item.table_name, item.column_name, item.column_name, item.column_name);
      END LOOP;
      UPDATE payload_preferences SET key = replace(replace(replace(key, 'posts', 'articles'), 'workshops', 'events'), 'poets', 'authors') WHERE key ~ '(posts|workshops|poets)';
    END $$;
  `);
}

export async function down(_: MigrateDownArgs): Promise<void> {
  throw new Error(
    "Editorial naming is a forward-only migration. Restore a database backup to revert it.",
  );
}
