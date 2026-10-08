import path from "node:path";
import { fileURLToPath } from "node:url";
import "./env";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { mcpPlugin } from "@payloadcms/plugin-mcp";
import { ar } from "@payloadcms/translations/languages/ar";
import { de } from "@payloadcms/translations/languages/de";
import { en } from "@payloadcms/translations/languages/en";
import { fa } from "@payloadcms/translations/languages/fa";
import { uk } from "@payloadcms/translations/languages/uk";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Authors } from "./collections/Authors";
import { Media } from "./collections/Media";
import { Pages } from "./collections/Pages";
import { Poems } from "./collections/Poems";
import { Users } from "./collections/Users";
import { Workshops } from "./collections/Workshops";
import { Homepage } from "./globals/Homepage";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: " · The Poetry Project" },
  },
  collections: [Users, Media, Pages, Authors, Workshops, Poems],
  globals: [Homepage],
  plugins: [
    mcpPlugin({
      collections: {
        media: {
          description:
            "Images and their localized accessible alternative text.",
          enabled: { find: true, create: true, update: true, delete: false },
        },
        pages: {
          description: "Localized structured pages for the public website.",
          enabled: { find: true, create: true, update: true, delete: false },
        },
        authors: {
          description: "Poet and author profiles used by published poetry.",
          enabled: { find: true, create: true, update: true, delete: false },
        },
        workshops: {
          description: "Localized workshop drafts and published event content.",
          enabled: { find: true, create: true, update: true, delete: false },
        },
        poems: {
          description:
            "Poem originals with optional explicit translation records.",
          enabled: { find: true, create: true, update: true, delete: false },
        },
      },
    }),
  ],
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL },
    migrationDir: path.resolve(dirname, "migrations"),
  }),
  editor: lexicalEditor(),
  localization: {
    locales: [
      { code: "de", label: "Deutsch" },
      { code: "en", label: "English" },
      { code: "ar", label: "العربية", rtl: true },
      { code: "fa", label: "فارسی", rtl: true },
      { code: "uk", label: "Українська" },
      { code: "ku", label: "Kurdî (Kurmancî)" },
    ],
    defaultLocale: "de",
    fallback: false,
  },
  i18n: { supportedLanguages: { de, en, ar, fa, uk } },
  secret: process.env.PAYLOAD_SECRET ?? "",
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL ?? "http://localhost:3001",
  sharp,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
});
