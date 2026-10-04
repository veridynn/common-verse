import type { CollectionConfig } from "payload";
import { authenticated, publishedOrAuthenticated } from "./access";

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: { useAsTitle: "title", group: "Content" },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
    readVersions: authenticated,
  },
  versions: { drafts: { autosave: true } },
  fields: [
    { name: "title", type: "text", localized: true, required: true },
    {
      name: "slug",
      type: "text",
      localized: true,
      required: true,
      index: true,
    },
    {
      name: "layout",
      type: "blocks",
      localized: true,
      blocks: [
        {
          slug: "richText",
          labels: { singular: "Text", plural: "Text sections" },
          fields: [{ name: "text", type: "textarea", required: true }],
        },
        {
          slug: "quote",
          fields: [
            { name: "quote", type: "textarea", required: true },
            { name: "attribution", type: "text" },
          ],
        },
        {
          slug: "image",
          fields: [
            {
              name: "image",
              type: "upload",
              relationTo: "media",
              required: true,
            },
          ],
        },
      ],
    },
  ],
};
