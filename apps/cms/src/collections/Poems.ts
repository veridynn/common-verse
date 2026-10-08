import type { CollectionConfig } from "payload";
import { isLocale, localizedPath } from "@poetry/i18n";
import { authenticated, publishedOrAuthenticated } from "./access";
import { previewEndpoint } from "./preview";

const languageOptions = [
  { label: "German", value: "de" },
  { label: "English", value: "en" },
  { label: "Arabic", value: "ar" },
  { label: "Persian", value: "fa" },
  { label: "Ukrainian", value: "uk" },
  { label: "Kurdish (Kurmanji)", value: "ku" },
  { label: "Other language", value: "other" },
];

export const Poems: CollectionConfig = {
  slug: "poems",
  admin: {
    useAsTitle: "title",
    group: "Poetry",
    description:
      "Keep the original poem intact and add only the translations that actually exist.",
    preview: (doc, { locale }) => {
      const siteUrl = process.env.PUBLIC_SITE_URL ?? "http://localhost:4321";
      const code = locale ?? "de";
      if (!isLocale(code)) return null;
      const params = new URLSearchParams({
        previewSecret: process.env.PREVIEW_SECRET ?? "",
      });
      return new URL(
        `${localizedPath(code, `poems/${doc.slug ?? ""}`)}?${params}`,
        siteUrl,
      ).href;
    },
  },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
    readVersions: authenticated,
  },
  endpoints: [previewEndpoint("poems")],
  versions: { drafts: { autosave: { interval: 375 } } },
  fields: [
    { name: "title", type: "text", required: true, label: "Original title" },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    {
      name: "originalLanguage",
      type: "select",
      required: true,
      options: languageOptions,
    },
    {
      name: "originalLanguageLabel",
      type: "text",
      admin: {
        condition: (_, siblingData) => siblingData.originalLanguage === "other",
      },
    },
    { name: "originalText", type: "textarea", required: true },
    { name: "author", type: "relationship", relationTo: "authors" },
    { name: "media", type: "upload", relationTo: "media", hasMany: true },
    {
      name: "translations",
      type: "array",
      labels: { singular: "Translation", plural: "Available translations" },
      fields: [
        {
          name: "language",
          type: "select",
          required: true,
          options: languageOptions,
        },
        {
          name: "languageLabel",
          type: "text",
          admin: {
            condition: (_, siblingData) => siblingData.language === "other",
          },
        },
        { name: "title", type: "text", required: true },
        { name: "text", type: "textarea", required: true },
        { name: "translator", type: "text" },
      ],
    },
  ],
};
