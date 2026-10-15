import { validPublicSlug } from "./slug";
import { label } from "@poetry/cms-ui";
import type { CollectionConfig } from "payload";
import { authenticated, publishedOrAuthenticated } from "./access";
import { collectionPreviewUrl, previewEndpoint } from "./preview";

export const Events: CollectionConfig = {
  slug: "events",
  labels: { singular: label("event"), plural: label("events") },
  admin: {
    useAsTitle: "title",
    group: label("content"),
    defaultColumns: ["title", "startDate", "_status", "updatedAt"],
    description: label("events_help"),
    preview: (doc, { locale, req }) =>
      collectionPreviewUrl("events", doc.slug, locale, req.i18n.language),
    livePreview: {
      url: ({ data, locale, req }) =>
        collectionPreviewUrl(
          "events",
          data.slug,
          locale?.code,
          req.i18n.language,
        ),
    },
  },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
    readVersions: authenticated,
  },
  endpoints: [previewEndpoint("events")],
  versions: { drafts: { autosave: { interval: 375 } } },
  fields: [
    {
      name: "kind",
      label: label("kind"),
      type: "select",
      defaultValue: "workshop",
      options: [
        { label: label("workshop"), value: "workshop" },
        { label: label("reading_or_event"), value: "event" },
      ],
    },
    {
      name: "title",
      label: label("title"),
      type: "text",
      localized: true,
      required: true,
    },
    {
      name: "slug",
      validate: validPublicSlug,
      label: label("slug"),
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description: label(
          "stable_url_segment_shared_by_every_language_version",
        ),
      },
    },
    {
      name: "description",
      label: label("description"),
      type: "textarea",
      localized: true,
    },
    {
      name: "content",
      label: label("content"),
      type: "textarea",
      localized: true,
    },
    {
      name: "image",
      label: label("image"),
      type: "upload",
      relationTo: "media",
    },
    {
      name: "startDate",
      label: label("start_date"),
      type: "date",
      required: true,
      admin: { date: { pickerAppearance: "dayAndTime" } },
    },
    {
      name: "endDate",
      label: label("end_date"),
      type: "date",
      admin: { date: { pickerAppearance: "dayAndTime" } },
    },
    {
      name: "location",
      label: label("location"),
      type: "text",
      localized: true,
    },
    { name: "registrationUrl", type: "text", label: label("registration_url") },
    {
      name: "seo",
      type: "group",
      label: label("search_and_social_sharing"),
      // Retain stored metadata while removing its controls from the event editor.
      admin: { hidden: true },
      fields: [
        {
          name: "title",
          type: "text",
          localized: true,
          label: label("seo_title"),
        },
        {
          name: "description",
          type: "textarea",
          localized: true,
          label: label("meta_description"),
          admin: { description: label("meta_description_help") },
          maxLength: 170,
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          label: label("social_image"),
        },
        {
          name: "noIndex",
          type: "checkbox",
          defaultValue: false,
          label: label("hide_from_search_engines"),
        },
      ],
    },
  ],
};
