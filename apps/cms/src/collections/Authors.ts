import { label } from "@poetry/cms-ui";
import type { CollectionConfig } from "payload";
import { authenticated } from "./access";

export const Authors: CollectionConfig = {
  slug: "authors",
  labels: { singular: label("author"), plural: label("authors") },
  admin: { useAsTitle: "name", group: label("content") },
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
  ],
};
