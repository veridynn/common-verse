import { locales, type Locale } from "@poetry/i18n";
import type { PayloadListResponse, Poem, Workshop } from "@poetry/types";

const cmsUrl = import.meta.env.PUBLIC_CMS_URL ?? "http://localhost:3001";

type Collection = "workshops" | "poems";

async function fetchCollection<T>(
  collection: Collection,
  locale: Locale,
): Promise<T[]> {
  const url = new URL(`/api/${collection}`, cmsUrl);
  url.searchParams.set("locale", locale);
  url.searchParams.set("depth", "2");
  url.searchParams.set("limit", "100");
  url.searchParams.set(
    "sort",
    collection === "workshops" ? "startDate" : "title",
  );
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Payload request failed with ${response.status}`);
  const data = (await response.json()) as PayloadListResponse<T>;
  return data.docs;
}

async function fetchDocument<T>(
  collection: Collection,
  slug: string,
  locale: Locale,
  previewSecret?: string,
): Promise<T | null> {
  const preview = Boolean(previewSecret);
  const path = preview ? `/api/${collection}/preview` : `/api/${collection}`;
  const url = new URL(path, cmsUrl);
  url.searchParams.set("locale", locale);
  url.searchParams.set("depth", "2");
  if (preview) url.searchParams.set("slug", slug);
  else url.searchParams.set("where[slug][equals]", slug);
  url.searchParams.set("limit", "1");
  const response = await fetch(url, {
    headers: previewSecret ? { "x-preview-secret": previewSecret } : {},
  });
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Payload request failed with ${response.status}`);
  }
  const data = (await response.json()) as PayloadListResponse<T>;
  return data.docs[0] ?? null;
}

export const getWorkshop = (
  slug: string,
  locale: Locale,
  previewSecret?: string,
) => fetchDocument<Workshop>("workshops", slug, locale, previewSecret);

export const getPoem = (slug: string, locale: Locale, previewSecret?: string) =>
  fetchDocument<Poem>("poems", slug, locale, previewSecret);

export const getWorkshops = (locale: Locale) =>
  fetchCollection<Workshop>("workshops", locale);

export const getPoems = (locale: Locale) =>
  fetchCollection<Poem>("poems", locale);

export async function getWorkshopLocales(
  slug: string,
  previewSecret?: string,
): Promise<Locale[]> {
  const localized = await Promise.all(
    locales.map(async (locale) => ({
      locale,
      workshop: await getWorkshop(slug, locale, previewSecret),
    })),
  );
  return localized
    .filter(({ workshop }) => Boolean(workshop?.title))
    .map(({ locale }) => locale);
}
