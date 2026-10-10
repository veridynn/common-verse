import { label } from "@poetry/cms-ui";
import type { CollectionConfig } from "payload";
import { authenticated, publishedOrAuthenticated } from "./access";

export const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: label("page"), plural: label("pages") },

  admin: { useAsTitle: "title", group: label("content") },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
    readVersions: authenticated,
  },
  versions: { drafts: { autosave: true } },
  fields: [
    {
      name: "title",
      label: label("title"),
      type: "text",
      localized: true,
      required: true,
    },
    {
      name: "slug",
      label: label("slug"),
      type: "text",
      localized: true,
      required: true,
      index: true,
    },
    {
      name: "layout",
      labels: { singular: label("section"), plural: label("sections") },
      label: label("layout"),
      type: "blocks",
      localized: true,
      blocks: [
        {
          slug: "richText",
          labels: { singular: label("text"), plural: label("text_sections") },
          fields: [
            {
              name: "text",
              label: label("text"),
              type: "textarea",
              required: true,
            },
          ],
        },
        {
          slug: "quote",
          labels: { singular: label("quote"), plural: label("quotes") },
          fields: [
            {
              name: "quote",
              label: label("quote"),
              type: "textarea",
              required: true,
            },
            { name: "attribution", label: label("attribution"), type: "text" },
          ],
        },
        {
          slug: "image",
          labels: { singular: label("image"), plural: label("images") },
          fields: [
            {
              name: "image",
              label: label("image"),
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
