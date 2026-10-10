import { label } from "@poetry/cms-ui";
import type { CollectionConfig } from "payload";
import { authenticated, isEditor } from "./access";

export const Authors: CollectionConfig = {
  slug: "authors",
  labels: { singular: label("author"), plural: label("authors") },
  admin: {
    hidden: true,
    useAsTitle: "name",
    group: label("content"),
    description: label("authors_help"),
  },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: "name", label: label("name"), type: "text", required: true },
    {
      name: "biography",
      label: label("biography"),
      type: "textarea",
      localized: true,
    },
    {
      name: "portrait",
      label: label("portrait"),
      type: "upload",
      relationTo: "media",
    },
    {
      name: "poems",
      label: label("poems_by_author"),
      type: "join",
      collection: "poems",
      on: "author",
      access: { read: ({ req }) => isEditor(req) },
      admin: { defaultColumns: ["title", "originalLanguage", "_status"] },
    },
  ],
};
