import { eventLocationField } from "./locationField";
import { validPublicSlug } from "./slug";
import { label } from "@poetry/cms-ui";
import { slugField, type CollectionConfig } from "payload";
import { eventEditor } from "../utilities/proseEditor";
import { prepareEvent, eventSlug, validEventPrice } from "./eventFields";
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
  hooks: { beforeValidate: [prepareEvent] },
  versions: { drafts: { autosave: { interval: 375 } } },
  fields: [
    {
      name: "title",
      label: label("title"),
      type: "text",
      localized: true,
      required: true,
      admin: {
        className: "event-editor-title",
      },
    },
    ...slugField({
      slugify: eventSlug,
      overrides: (row) => {
        // Generate only missing slugs; saved URLs stay stable, including drafts.
        row.fields = row.fields.filter((field) => field.type === "text");
        for (const field of row.fields) {
          if (field.type !== "text") continue;
          field.label = label("slug");
          field.validate = validPublicSlug;
          field.admin = {
            ...field.admin,
            hidden: true,
            description: label(
              "stable_url_segment_shared_by_every_language_version",
            ),
          };
        }
        return row;
      },
    }).fields,
    {
      name: "description",
      label: label("description"),
      type: "text",
      localized: true,
      required: true,
    },
    {
      name: "registrationUrl",
      type: "text",
      label: label("registration_url"),
      required: true,
    },
    {
      name: "image",
      label: label("event_cover_image"),
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "startDate",
      label: label("date_and_time"),
      type: "date",
      required: true,
      admin: { date: { pickerAppearance: "dayAndTime" } },
    },
    eventLocationField(),
    {
      name: "endDate",
      label: label("end_date"),
      type: "date",
      admin: { hidden: true },
    },
    {
      type: "collapsible",
      label: label("event_details"),
      admin: {
        hidden: true,
        className: "event-editor-details",
        initCollapsed: false,
      },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "kind",
              label: label("event_type"),
              type: "select",
              defaultValue: "workshop",
              required: true,
              options: [
                { label: label("workshop"), value: "workshop" },
                { label: label("reading"), value: "event" },
              ],
            },
            {
              name: "price",
              label: label("price_eur"),
              type: "number",
              min: 0,
              validate: validEventPrice,
              admin: {
                step: 0.01,
                description: label("price_help"),
                condition: (data) => data.kind === "event",
              },
            },
          ],
        },
      ],
    },
    {
      name: "content",
      label: label("content"),
      type: "richText",
      localized: true,
      required: true,
      editor: eventEditor,
      admin: {
        className: "event-editor-content",
        components: {
          beforeInput: ["./components/EventFields#EditorAccessibility"],
        },
        description: label("event_content_help"),
      },
    },
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
