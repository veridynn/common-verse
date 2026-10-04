import type { CollectionConfig } from "payload";
import { authenticated } from "./access";

export const Authors: CollectionConfig = {
  slug: "authors",
  admin: { useAsTitle: "name", group: "Content" },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "biography", type: "textarea", localized: true },
    { name: "portrait", type: "upload", relationTo: "media" },
  ],
};
