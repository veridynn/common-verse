import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: { useAsTitle: "email", group: "Administration" },
  fields: [
    { name: "name", type: "text", required: true, label: "Display name" },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "editor",
      options: [
        { label: "Editor", value: "editor" },
        { label: "Administrator", value: "admin" },
      ],
    },
  ],
};
