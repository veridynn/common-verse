import type { Locale } from "@poetry/i18n";

export interface MediaReference {
  id: number | string;
  alt: string;
  url?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface Workshop {
  id: number | string;
  title: string;
  slug: string;
  description?: string | null;
  content?: string | null;
  image?: MediaReference | number | string | null;
  startDate: string;
  endDate?: string | null;
  location?: string | null;
  registrationUrl?: string | null;
  seo?: {
    title?: string | null;
    description?: string | null;
    image?: MediaReference | number | string | null;
    noIndex?: boolean | null;
  } | null;
  _status?: "draft" | "published";
}

export interface PoemTranslation {
  language: Locale | "other";
  languageLabel?: string | null;
  title: string;
  text: string;
  translator?: string | null;
}

export interface Poem {
  id: number | string;
  slug: string;
  title: string;
  originalLanguage: Locale | "other";
  originalLanguageLabel?: string | null;
  originalText: string;
  author?: { id: number | string; name: string } | number | string | null;
  translations?: PoemTranslation[] | null;
  _status?: "draft" | "published";
}

export interface PayloadListResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}
