import { label } from "@poetry/cms-ui";
import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: label("user"), plural: label("users") },

  auth: true,
  admin: { useAsTitle: "email", group: label("administration") },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: label("display_name"),
    },
    {
      name: "role",
      label: label("role"),
      type: "select",
      required: true,
      defaultValue: "editor",
      options: [
        { label: label("editor"), value: "editor" },
        { label: label("administrator"), value: "admin" },
      ],
    },
  ],
};
