import { label } from "@poetry/cms-ui";
import {
  lexicalEditor,
  ParagraphFeature,
  HeadingFeature,
  BoldFeature,
  ItalicFeature,
  UnorderedListFeature,
  OrderedListFeature,
  LinkFeature,
  FixedToolbarFeature,
  InlineToolbarFeature,
} from "@payloadcms/richtext-lexical";
import {
  fixedPageKeys,
  isLocale,
  localizedPath,
  type FixedPageKey,
} from "@poetry/i18n";
import type { GlobalConfig } from "payload";
import { authenticated } from "../collections/access";

export function fixedPagePreviewUrl(
  page: FixedPageKey,
  locale = "de",
  editorLanguage = "en",
) {
  const secret = process.env.PREVIEW_SECRET;
  if (!secret || !isLocale(locale)) return null;
  const url = new URL(
    localizedPath(locale, page),
    process.env.PUBLIC_SITE_URL ?? "http://localhost:4321",
  );
  url.searchParams.set("previewSecret", secret);
  url.searchParams.set("editorLanguage", editorLanguage);
  return url.href;
}

export const FixedPages: GlobalConfig[] = fixedPageKeys.map((slug) => ({
  slug,
  label: label(slug),
  admin: {
    group: label("pages"),
    preview: (_, { locale, req }) =>
      fixedPagePreviewUrl(slug, locale, req.i18n.language),
    livePreview: {
      url: ({ locale, req }) =>
        fixedPagePreviewUrl(slug, locale?.code, req.i18n.language),
    },
  },
  access: {
    read: authenticated,
    update: authenticated,
    readVersions: authenticated,
  },
  versions: { drafts: { autosave: { interval: 500 } }, max: 30 },
  endpoints: ["public", "preview"].map((mode) => ({
    path: `/${mode}`,
    method: "get",
    handler: async (req) => {
      const preview = mode === "preview";
      if (
        preview &&
        (!process.env.PREVIEW_SECRET ||
          req.headers.get("x-preview-secret") !== process.env.PREVIEW_SECRET)
      ) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      const locale =
        new URL(req.url ?? "", "http://localhost").searchParams.get("locale") ??
        "de";
      if (!isLocale(locale))
        return Response.json({ error: "Invalid locale" }, { status: 400 });
      const doc = await req.payload.findGlobal({
        slug,
        locale,
        fallbackLocale: false,
        depth: 0,
        draft: preview,
        overrideAccess: true,
      });
      return Response.json(
        preview || doc._status === "published" ? doc : null,
        { headers: { "Cache-Control": "no-store" } },
      );
    },
  })),
  fields: [
    {
      name: "title",
      label: label("title"),
      type: "text",
      localized: true,
      required: true,
    },
    {
      name: "content",
      label: label("text"),
      type: "richText",
      editor: lexicalEditor({
        features: [
          ParagraphFeature(),
          HeadingFeature({ enabledHeadingSizes: ["h2", "h3"] }),
          BoldFeature(),
          ItalicFeature(),
          UnorderedListFeature(),
          OrderedListFeature(),
          LinkFeature({ enabledCollections: [] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
      localized: true,
      required: true,
    },
    {
      name: "description",
      label: label("meta_description"),
      type: "textarea",
      localized: true,
      admin: { description: label("meta_description_help") },
    },
  ],
}));
