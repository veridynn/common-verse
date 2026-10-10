import { label } from "@poetry/cms-ui";
import type { CollectionConfig } from "payload";
import { authenticated } from "./access";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: label("media"), plural: label("media") },
  admin: { useAsTitle: "alt", group: label("content") },
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
      label: label("alternative_text"),
      admin: {
        description: label("describe_the_image_for_visitors_who_cannot_see_it"),
      },
    },
    { name: "credit", type: "text", label: label("photo_artwork_credit") },
  ],
};
