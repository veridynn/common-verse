import http from "node:http";
import { homepageContent } from "../../apps/cms/scripts/seed/homepage-content.ts";

const workshops = {
  de: [
    "Poesie über Grenzen",
    "Ein offener Workshop über Sprache, Erinnerung und Begegnung.",
  ],
  en: [
    "Poetry Across Borders",
    "An open workshop about language, memory, and connection.",
  ],
  ar: ["الشعر عبر الحدود", "ورشة مفتوحة حول اللغة والذاكرة والتواصل."],
  fa: ["شعر فراتر از مرزها", "کارگاهی آزاد دربارهٔ زبان، خاطره و پیوند."],
  uk: [
    "Поезія без кордонів",
    "Відкрита майстерня про мову, пам’ять і зв’язок.",
  ],
  ku: [
    "Helbest li Ser Sînoran",
    "Atolyeyeke vekirî li ser ziman, bîranîn û têkilî.",
  ],
};

const media = {
  id: 1,
  alt: "Layered colourful paper shapes",
  url: "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 2 1%22%3E%3Crect width=%222%22 height=%221%22 fill=%22%237f2f3b%22/%3E%3C/svg%3E",
  width: 1200,
  height: 600,
};

function workshop(locale, preview) {
  const [title, description] = workshops[locale] ?? workshops.de;
  return {
    id: 1,
    title: preview ? `${title} — draft` : title,
    slug: "test",
    description,
    content: description,
    image: media,
    startDate: "2026-11-14T13:00:00.000Z",
    endDate: "2026-11-14T16:00:00.000Z",
    location: "The Poetry Project, Berlin",
    registrationUrl: "https://example.org/register",
    seo: { title, description, image: media, noIndex: false },
    _status: preview ? "draft" : "published",
  };
}

const poem = {
  id: 2,
  slug: "test-poem",
  title: "صبح مشترک",
  originalLanguage: "fa",
  originalText: "صبح از میان پنجره‌های ما می‌گذرد",
  author: { id: 3, name: "Prototype Collective" },
  translations: [
    {
      language: "de",
      title: "Gemeinsamer Morgen",
      text: "Der Morgen zieht durch unsere Fenster",
      translator: "Prototype translation",
    },
    {
      language: "en",
      title: "A Shared Morning",
      text: "Morning passes through our windows",
      translator: "Prototype translation",
    },
  ],
  _status: "published",
};

const authors = [poem.author, { id: 4, name: "Workshop Collective" }];

function homepage(locale, preview) {
  const content = structuredClone(
    homepageContent[locale] ?? homepageContent.de,
  );
  const feature =
    locale === "de"
      ? { kind: "event", event: workshop(locale, false) }
      : locale === "fa"
        ? {
            kind: "announcement",
            announcement: {
              title: "خبر تازه",
              text: "با هم می‌نویسیم",
              linkLabel: "بیشتر بخوانید",
              linkUrl: "/workshops",
            },
          }
        : { kind: "poem", poem };
  Object.assign(feature, content.feature, { kind: feature.kind });
  const sections = content.sections.map((section) => ({
    ...section,
    ...(section.blockType === "poets" ? { poets: authors } : {}),
  }));
  sections.push({
    blockType: "newsletter",
    enabled: false,
    heading: "Hidden section",
  });
  if (["ar", "ku"].includes(locale)) {
    feature.heading = null;
    feature.description = null;
    sections.find(
      (section) => section.blockType === "introduction",
    ).description = null;
    const participation = sections.find(
      (section) => section.blockType === "participation",
    );
    participation.links = [];
    sections.find((section) => section.blockType === "newsletter").heading =
      null;
  }
  if (preview) {
    feature.heading = "Draft homepage";
    sections.splice(0, 2, sections[1], sections[0]);
  }
  return { feature, sections, _status: preview ? "draft" : "published" };
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://127.0.0.1:3001");
  response.setHeader("content-type", "application/json; charset=utf-8");
  if (url.pathname === "/health")
    return response.end(JSON.stringify({ ok: true }));

  if (url.pathname === "/preview-host") {
    const previewURL = new URL(
      "/en?previewSecret=test-preview",
      process.env.MOCK_WEB_ORIGIN ?? "http://127.0.0.1:4321",
    );
    response.setHeader("content-type", "text/html; charset=utf-8");
    return response.end(
      `<script>window.addEventListener('message', (event) => { if (event.data?.ready) document.body.dataset.ready = 'true' })</script><iframe title="Homepage preview" src="${previewURL.href}"></iframe>`,
    );
  }

  const isPreview = url.pathname.endsWith("/preview");
  if (isPreview && request.headers["x-preview-secret"] !== "test-preview") {
    response.statusCode = 401;
    return response.end(JSON.stringify({ error: "Unauthorized" }));
  }

  const locale = url.searchParams.get("locale") ?? "de";
  if (url.pathname.startsWith("/api/globals/homepage/")) {
    return response.end(JSON.stringify(homepage(locale, isPreview)));
  }
  if (url.pathname === "/api/authors") {
    return response.end(
      JSON.stringify({ docs: authors, totalDocs: authors.length }),
    );
  }
  if (url.pathname.startsWith("/api/authors/")) {
    const author = authors.find(
      (entry) => String(entry.id) === url.pathname.split("/").at(-1),
    );
    if (author) return response.end(JSON.stringify(author));
    response.statusCode = 404;
    return response.end(JSON.stringify({ error: "Not found" }));
  }
  if (url.pathname.startsWith("/api/workshops")) {
    const requestedSlug = isPreview
      ? url.searchParams.get("slug")
      : url.searchParams.get("where[slug][equals]");
    const document = workshop(locale, isPreview);
    if (requestedSlug === "partial" && locale === "fa") document.title = null;
    return response.end(JSON.stringify({ docs: [document], totalDocs: 1 }));
  }
  if (url.pathname.startsWith("/api/poems")) {
    const author = url.searchParams.get("where[author][equals]");
    if (author === "4") {
      if (url.searchParams.get("page") === "2") {
        return response.end(
          JSON.stringify({
            docs: [
              {
                ...poem,
                id: 6,
                slug: "next-page-poem",
                title: "A poem on the next page",
                author: authors[1],
              },
            ],
            totalDocs: 2,
            hasNextPage: false,
          }),
        );
      }
      return response.end(
        JSON.stringify({
          docs: [
            {
              ...poem,
              id: 5,
              slug: "later-poem",
              title: "A later poem",
              originalLanguage: "en",
              originalText: "A voice beyond the first archive page",
              author: authors[1],
              translations: [],
            },
          ],
          totalDocs: 1,
          hasNextPage: url.searchParams.get("limit") !== "1",
        }),
      );
    }
    return response.end(JSON.stringify({ docs: [poem], totalDocs: 1 }));
  }

  response.statusCode = 404;
  response.end(JSON.stringify({ error: "Not found" }));
});

server.listen(Number(process.env.MOCK_CMS_PORT ?? 3001), "127.0.0.1");

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
