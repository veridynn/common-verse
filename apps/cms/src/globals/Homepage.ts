import { isLocale, localizedPath } from "@poetry/i18n";
import type { Block, Field, GlobalConfig } from "payload";
import { authenticated } from "../collections/access";

const text = (
  name: string,
  label: string,
  type: "text" | "textarea" = "text",
): Field =>
  type === "textarea"
    ? { name, label, type: "textarea", localized: true }
    : { name, label, type: "text", localized: true };

export const validLink = (value: unknown): true | string => {
  if (!value) return true;
  if (typeof value !== "string")
    return "Enter a website URL, email link, or site path.";
  if (/^\/(?!\/)/.test(value) && !/[\\\s]/.test(value)) return true;
  try {
    const url = new URL(value);
    if (["https:", "http:", "mailto:"].includes(url.protocol)) return true;
  } catch {
    /* Invalid URL. */
  }
  return "Use https://, mailto:, or a path beginning with one slash.";
};

/** Populated draft relationships must not escape through the anonymous homepage API. */
export function publishedContent(value: unknown): unknown {
  if (Array.isArray(value))
    return value.map(publishedContent).filter((entry) => entry !== null);
  if (!value || typeof value !== "object") return value;
  const record = value as Record<string, unknown>;
  if (record._status === "draft") return null;
  return Object.fromEntries(
    Object.entries(record).map(([key, entry]) => [
      key,
      publishedContent(entry),
    ]),
  );
}

const linkFields: Field[] = [
  text("linkLabel", "Link text"),
  {
    name: "linkUrl",
    type: "text",
    label: "Link destination",
    validate: validLink,
  },
];
const optionalFields: Field[] = [
  {
    name: "enabled",
    type: "checkbox",
    defaultValue: true,
    label: "Show this section",
  },
  text("heading", "Heading"),
  text("description", "Introduction", "textarea"),
];

const blocks: Block[] = [
  {
    slug: "introduction",
    labels: {
      singular: "Project introduction",
      plural: "Project introductions",
    },
    fields: [
      text("heading", "Heading"),
      text("description", "Project introduction", "textarea"),
      { name: "image", type: "upload", relationTo: "media" },
      ...linkFields,
    ],
  },
  {
    slug: "poets",
    labels: { singular: "Featured poets", plural: "Featured poets" },
    fields: [
      ...optionalFields,
      {
        name: "poets",
        type: "relationship",
        relationTo: "authors",
        hasMany: true,
        maxRows: 4,
        admin: {
          description:
            "Choose up to four poets in display order. Leave empty to show the latest profiles.",
        },
      },
    ],
  },
  {
    slug: "events",
    labels: {
      singular: "Upcoming events and workshops",
      plural: "Event sections",
    },
    fields: [
      ...optionalFields,
      {
        name: "pinnedEvents",
        type: "relationship",
        relationTo: "workshops",
        hasMany: true,
        maxRows: 3,
        admin: {
          description:
            "Prioritise up to three upcoming events. Past events are excluded automatically.",
        },
      },
      {
        name: "limit",
        type: "number",
        min: 1,
        max: 6,
        defaultValue: 3,
        label: "Number of events",
      },
    ],
  },
  {
    slug: "participation",
    labels: { singular: "Take part", plural: "Participation sections" },
    fields: [
      ...optionalFields,
      {
        name: "links",
        type: "array",
        maxRows: 3,
        labels: { singular: "Way to take part", plural: "Ways to take part" },
        fields: [
          text("title", "Title"),
          text("description", "Description", "textarea"),
          { name: "url", type: "text", required: true, validate: validLink },
        ],
      },
    ],
  },
  {
    slug: "newsletter",
    labels: { singular: "Newsletter", plural: "Newsletter sections" },
    fields: [...optionalFields, ...linkFields],
  },
];

export function homepagePreviewUrl(locale: string = "de") {
  const secret = process.env.PREVIEW_SECRET;
  if (!secret || !isLocale(locale)) return null;
  const url = new URL(
    localizedPath(locale),
    process.env.PUBLIC_SITE_URL ?? "http://localhost:4321",
  );
  url.searchParams.set("previewSecret", secret);
  return url.href;
}

export const Homepage: GlobalConfig = {
  slug: "homepage",
  label: "Homepage",
  admin: {
    group: "Website",
    description:
      "Choose the opening feature, arrange the sections, and preview each language before publishing.",
    preview: (_, { locale }) => homepagePreviewUrl(locale),
    livePreview: {
      url: ({ locale }) => homepagePreviewUrl(locale?.code),
      breakpoints: [
        { name: "mobile", label: "Mobile", width: 390, height: 844 },
        { name: "tablet", label: "Tablet", width: 768, height: 1024 },
        { name: "desktop", label: "Desktop", width: 1440, height: 900 },
      ],
    },
  },
  access: {
    read: authenticated,
    update: authenticated,
    readVersions: authenticated,
  },
  versions: { drafts: { autosave: { interval: 500 } }, max: 30 },
  endpoints: [
    {
      path: "/public",
      method: "get",
      handler: async (req) => {
        const locale =
          new URL(req.url ?? "", "http://localhost").searchParams.get(
            "locale",
          ) ?? "de";
        if (!isLocale(locale))
          return Response.json({ error: "Invalid locale" }, { status: 400 });
        const doc = await req.payload.findGlobal({
          slug: "homepage",
          locale,
          fallbackLocale: false,
          depth: 2,
          draft: false,
          overrideAccess: true,
        });
        return Response.json(
          doc._status === "published" ? publishedContent(doc) : null,
        );
      },
    },
    {
      path: "/preview",
      method: "get",
      handler: async (req) => {
        if (
          !process.env.PREVIEW_SECRET ||
          req.headers.get("x-preview-secret") !== process.env.PREVIEW_SECRET
        )
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        const locale =
          new URL(req.url ?? "", "http://localhost").searchParams.get(
            "locale",
          ) ?? "de";
        if (!isLocale(locale))
          return Response.json({ error: "Invalid locale" }, { status: 400 });
        const doc = await req.payload.findGlobal({
          slug: "homepage",
          locale,
          fallbackLocale: false,
          depth: 2,
          draft: true,
          overrideAccess: true,
        });
        return Response.json(doc, { headers: { "Cache-Control": "no-store" } });
      },
    },
  ],
  fields: [
    {
      name: "feature",
      type: "group",
      label: "Opening feature",
      fields: [
        {
          name: "kind",
          type: "select",
          defaultValue: "poem",
          required: true,
          options: [
            { label: "Poem", value: "poem" },
            { label: "Event or workshop", value: "event" },
            { label: "Project announcement", value: "announcement" },
          ],
        },
        text("heading", "Homepage headline"),
        text("description", "Short introduction", "textarea"),
        {
          name: "poem",
          type: "relationship",
          relationTo: "poems",
          admin: { condition: (_, data) => data.kind === "poem" },
        },
        {
          name: "event",
          type: "relationship",
          relationTo: "workshops",
          admin: { condition: (_, data) => data.kind === "event" },
        },
        {
          name: "announcement",
          type: "group",
          admin: { condition: (_, data) => data.kind === "announcement" },
          fields: [
            text("title", "Announcement title"),
            text("text", "Announcement", "textarea"),
            { name: "image", type: "upload", relationTo: "media" },
            ...linkFields,
          ],
        },
      ],
    },
    {
      name: "sections",
      type: "blocks",
      blocks,
      minRows: 1,
      maxRows: 10,
      admin: {
        initCollapsed: true,
        description:
          "The project introduction is required. Other sections can be hidden, removed, or repeated.",
      },
      validate: (value) => {
        const rows = value as { blockType?: string }[] | null;
        return (
          rows?.filter((row) => row.blockType === "introduction").length ===
            1 || "Include exactly one project introduction."
        );
      },
      defaultValue: [
        { blockType: "introduction" },
        { blockType: "poets", enabled: true },
        { blockType: "events", enabled: true, limit: 3 },
        { blockType: "participation", enabled: true },
        { blockType: "newsletter", enabled: true },
      ],
    },
    {
      name: "seo",
      type: "group",
      label: "Search and social sharing",
      fields: [
        text("title", "Page title"),
        text("description", "Meta description", "textarea"),
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          label: "Social image",
        },
      ],
    },
  ],
};
