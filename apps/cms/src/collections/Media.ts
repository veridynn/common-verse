import type { CollectionConfig } from "payload";
import { authenticated } from "./access";

export const Media: CollectionConfig = {
  slug: "media",
  admin: { useAsTitle: "alt", group: "Content" },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  upload: {
    staticDir: "media",
    imageSizes: [
      { name: "card", width: 720, height: 480, position: "centre" },
      { name: "social", width: 1200, height: 630, position: "centre" },
    ],
    mimeTypes: ["image/*"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      localized: true,
      required: true,
      label: "Alternative text",
      admin: {
        description: "Describe the image for visitors who cannot see it.",
      },
    },
    { name: "credit", type: "text", label: "Photo / artwork credit" },
  ],
};
