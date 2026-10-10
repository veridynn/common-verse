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

const selectionMode: Field = {
  name: "selectionMode",
  type: "select",
  label: "Choose content",
  required: true,
  hooks: {
    afterRead: [
      ({ value, siblingData }) =>
        value ??
        (siblingData.poets?.length ||
        siblingData.pinnedEvents?.length ||
        siblingData.poems?.length
          ? "manual"
          : "auto"),
    ],
    beforeValidate: [
      ({ value, siblingData }) =>
        value ??
        (siblingData.poets?.length ||
        siblingData.pinnedEvents?.length ||
        siblingData.poems?.length
          ? "manual"
          : "auto"),
    ],
  },
  options: [
    { label: "Automatic", value: "auto" },
    { label: "Select manually", value: "manual" },
  ],
};

const blocks: Block[] = [
  {
    slug: "featured",
    labels: { singular: "Featured", plural: "Featured sections" },
    admin: { disableBlockName: true },
    fields: [
      ...optionalFields,
      {
        name: "item",
        type: "relationship",
        label: "Item to feature",
        relationTo: ["poems", "authors", "workshops"],
        required: true,
        admin: {
          description:
            "Choose a poem, poet, or event/workshop. Its image, title, description, and link come from the original record.",
        },
      },
    ],
  },
  {
    slug: "introduction",
    labels: { singular: "Mission", plural: "Mission" },
    admin: { disableBlockName: true },
    fields: [
      text("heading", "Heading"),
      text("description", "Project introduction", "textarea"),
      { name: "image", type: "upload", relationTo: "media" },
      ...linkFields,
    ],
  },
  {
    slug: "events",
    labels: { singular: "Events", plural: "Events sections" },
    admin: { disableBlockName: true },
    fields: [
      ...optionalFields,
      {
        ...selectionMode,
        admin: {
          description:
            "Automatic shows the four nearest upcoming events and workshops. Manual shows only your selection, in order.",
        },
      },
      {
        name: "pinnedEvents",
        label: "Events and workshops",
        type: "relationship",
        relationTo: "workshops",
        hasMany: true,
        maxRows: 4,
        admin: {
          condition: (_, data) => data.selectionMode === "manual",
          description:
            "Choose up to four. Past, draft, and untranslated events are omitted on the public site.",
        },
      },
      // Existing homepages retain their stored limit until editors choose a mode.
      {
        name: "limit",
        type: "number",
        min: 1,
        max: 6,
        admin: { hidden: true },
      },
    ],
  },
  {
    slug: "poems",
    labels: { singular: "Poems", plural: "Poem sections" },
    admin: { disableBlockName: true },
    fields: [
      ...optionalFields,
      {
        ...selectionMode,
        admin: {
          description:
            "Automatic shows the four most recently created published poems.",
        },
      },
      {
        name: "poems",
        type: "relationship",
        relationTo: "poems",
        hasMany: true,
        maxRows: 4,
        admin: {
          condition: (_, data) => data.selectionMode === "manual",
          description: "Choose up to four poems in display order.",
        },
      },
    ],
  },
  {
    slug: "poets",
    labels: { singular: "Poets", plural: "Poet sections" },
    admin: { disableBlockName: true },
    fields: [
      ...optionalFields,
      {
        ...selectionMode,
        admin: {
          description:
            "Automatic shows the four newest profiles with published poetry.",
        },
      },
      {
        name: "poets",
        type: "relationship",
        relationTo: "authors",
        hasMany: true,
        maxRows: 4,
        admin: {
          condition: (_, data) => data.selectionMode === "manual",
          description: "Choose up to four poets in display order.",
        },
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

export function homepagePreviewUrl(
  locale: string = "de",
  editorLanguage = "en",
) {
  const secret = process.env.PREVIEW_SECRET;
  if (!secret || !isLocale(locale)) return null;
  const url = new URL(
    localizedPath(locale),
    process.env.PUBLIC_SITE_URL ?? "http://localhost:4321",
  );
  url.searchParams.set("previewSecret", secret);
  url.searchParams.set("editorLanguage", editorLanguage);
  return url.href;
}

export const Homepage: GlobalConfig = {
  slug: "homepage",
  label: "Homepage",
  admin: {
    group: "Website",
    description:
      "Choose the hero, arrange the sections, and preview each language before publishing.",
    preview: (_, { locale, req }) =>
      homepagePreviewUrl(locale, req.i18n.language),
    livePreview: {
      url: ({ locale, req }) =>
        homepagePreviewUrl(locale?.code, req.i18n.language),
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
      label: "Hero",
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
      maxRows: 10,
      admin: {
        initCollapsed: true,
        description: "Add, reorder, remove, or repeat sections.",
      },
      defaultValue: [
        { blockType: "introduction" },
        { blockType: "poets", enabled: true, selectionMode: "auto" },
        { blockType: "poems", enabled: true, selectionMode: "auto" },
        { blockType: "events", enabled: true, selectionMode: "auto" },
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
