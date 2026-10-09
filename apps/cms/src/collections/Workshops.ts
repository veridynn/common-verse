import type { CollectionConfig } from "payload";
import { authenticated, publishedOrAuthenticated } from "./access";
import { collectionPreviewUrl, previewEndpoint } from "./preview";

export const Workshops: CollectionConfig = {
  slug: "workshops",
  labels: { singular: "Workshop", plural: "Workshops" },
  admin: {
    useAsTitle: "title",
    group: "Programme",
    defaultColumns: ["title", "startDate", "_status", "updatedAt"],
    description:
      "Create translated workshop pages and preview them before publishing.",
    preview: (doc, { locale }) =>
      collectionPreviewUrl("workshops", doc.slug, locale),
    livePreview: {
      url: ({ data, locale }) =>
        collectionPreviewUrl("workshops", data.slug, locale?.code),
    },
  },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
    readVersions: authenticated,
  },
  endpoints: [previewEndpoint("workshops")],
  versions: { drafts: { autosave: { interval: 375 } } },
  fields: [
    {
      name: "kind",
      type: "select",
      defaultValue: "workshop",
      options: [
        { label: "Workshop", value: "workshop" },
        { label: "Reading or event", value: "event" },
      ],
    },
    { name: "title", type: "text", localized: true, required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description: "Stable URL segment shared by every language version.",
      },
    },
    { name: "description", type: "textarea", localized: true },
    { name: "content", type: "textarea", localized: true },
    { name: "image", type: "upload", relationTo: "media" },
    {
      name: "startDate",
      type: "date",
      required: true,
      admin: { date: { pickerAppearance: "dayAndTime" } },
    },
    {
      name: "endDate",
      type: "date",
      admin: { date: { pickerAppearance: "dayAndTime" } },
    },
    { name: "location", type: "text", localized: true },
    { name: "registrationUrl", type: "text", label: "Registration URL" },
    {
      name: "seo",
      type: "group",
      label: "Search and social sharing",
      fields: [
        { name: "title", type: "text", localized: true, label: "SEO title" },
        {
          name: "description",
          type: "textarea",
          localized: true,
          label: "Meta description",
          maxLength: 170,
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          label: "Social image",
        },
        {
          name: "noIndex",
          type: "checkbox",
          defaultValue: false,
          label: "Hide from search engines",
        },
      ],
    },
  ],
};
