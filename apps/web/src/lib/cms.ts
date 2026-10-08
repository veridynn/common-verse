import { locales, type Locale } from "@poetry/i18n";
import type {
  Author,
  Homepage,
  PayloadListResponse,
  Poem,
  Workshop,
} from "@poetry/types";

const cmsUrl = import.meta.env.PUBLIC_CMS_URL ?? "http://localhost:3001";

type Collection = "workshops" | "poems" | "authors";

async function fetchCollection<T>(
  collection: Collection,
  locale: Locale,
): Promise<T[]> {
  const url = new URL(`/api/${collection}`, cmsUrl);
  url.searchParams.set("locale", locale);
  url.searchParams.set("fallback-locale", "none");
  url.searchParams.set("depth", "2");
  url.searchParams.set("limit", "100");
  url.searchParams.set(
    "sort",
    collection === "workshops"
      ? "startDate"
      : collection === "authors"
        ? "-createdAt"
        : "title",
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
  url.searchParams.set("fallback-locale", "none");
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

export const getAuthors = (locale: Locale) =>
  fetchCollection<Author>("authors", locale);

/** Query a poet directly so their work is not lost beyond the archive's first page. */
export async function getAuthorPoems(
  id: string,
  locale: Locale,
  limit?: number,
): Promise<Poem[]> {
  const poems: Poem[] = [];
  let page = 1;
  let hasNextPage = false;
  do {
    const url = new URL("/api/poems", cmsUrl);
    url.searchParams.set("locale", locale);
    url.searchParams.set("fallback-locale", "none");
    url.searchParams.set("depth", "2");
    url.searchParams.set("where[author][equals]", id);
    url.searchParams.set("sort", "title");
    url.searchParams.set("limit", String(limit ?? 100));
    url.searchParams.set("page", String(page));
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Poet poems request failed with ${response.status}`);
    const data = (await response.json()) as PayloadListResponse<Poem>;
    poems.push(...data.docs);
    hasNextPage = !limit && data.hasNextPage;
    page += 1;
  } while (hasNextPage);
  return poems;
}

export async function getUpcomingWorkshops(
  locale: Locale,
): Promise<Workshop[]> {
  const url = new URL("/api/workshops", cmsUrl);
  url.searchParams.set("locale", locale);
  url.searchParams.set("fallback-locale", "none");
  url.searchParams.set("depth", "2");
  url.searchParams.set("sort", "startDate");
  url.searchParams.set("limit", "6");
  const now = new Date().toISOString();
  url.searchParams.set("where[or][0][startDate][greater_than_equal]", now);
  url.searchParams.set("where[or][1][endDate][greater_than_equal]", now);
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Programme request failed with ${response.status}`);
  const data = (await response.json()) as PayloadListResponse<Workshop>;
  return data.docs;
}

export async function getAuthor(
  id: string,
  locale: Locale,
): Promise<Author | null> {
  const url = new URL(`/api/authors/${encodeURIComponent(id)}`, cmsUrl);
  url.searchParams.set("locale", locale);
  url.searchParams.set("fallback-locale", "none");
  const response = await fetch(url);
  if (response.status === 404) return null;
  if (!response.ok)
    throw new Error(`Payload request failed with ${response.status}`);
  return response.json();
}

export async function getHomepage(
  locale: Locale,
  previewSecret?: string,
): Promise<Homepage | null> {
  const url = new URL(
    `/api/globals/homepage/${previewSecret ? "preview" : "public"}`,
    cmsUrl,
  );
  url.searchParams.set("locale", locale);
  const response = await fetch(url, {
    headers: previewSecret ? { "x-preview-secret": previewSecret } : {},
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok)
    throw new Error(`Homepage request failed with ${response.status}`);
  return response.json();
}

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
