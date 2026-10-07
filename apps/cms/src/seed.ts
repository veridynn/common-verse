import { randomUUID } from "node:crypto";
import { readFile, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Payload } from "payload";

const translations = {
  de: {
    title: "Poesie über Grenzen",
    description: "Ein offener Workshop über Sprache, Erinnerung und Begegnung.",
    content:
      "Wir lesen gemeinsam, schreiben in mehreren Sprachen und teilen Texte in einer unterstützenden Runde.",
    location: "The Poetry Project, Berlin",
    seoTitle: "Poesie über Grenzen – Workshop",
    seoDescription: "Mehrsprachiger Poesie-Workshop in Berlin.",
    alt: "Bunte Papierformen, die sich wie Verse überlagern",
  },
  en: {
    title: "Poetry Across Borders",
    description: "An open workshop about language, memory, and connection.",
    content:
      "We read together, write across languages, and share work in a supportive circle.",
    location: "The Poetry Project, Berlin",
    seoTitle: "Poetry Across Borders – Workshop",
    seoDescription: "A multilingual poetry workshop in Berlin.",
    alt: "Colourful paper forms overlapping like lines of verse",
  },
  ar: {
    title: "الشعر عبر الحدود",
    description: "ورشة مفتوحة حول اللغة والذاكرة والتواصل.",
    content: "نقرأ معًا ونكتب بلغات متعددة ونتشارك النصوص في حلقة داعمة.",
    location: "مشروع الشعر، برلين",
    seoTitle: "الشعر عبر الحدود – ورشة",
    seoDescription: "ورشة شعر متعددة اللغات في برلين.",
    alt: "أشكال ورقية ملوّنة تتداخل مثل أبيات الشعر",
  },
  fa: {
    title: "شعر فراتر از مرزها",
    description: "کارگاهی آزاد دربارهٔ زبان، خاطره و پیوند.",
    content:
      "با هم می‌خوانیم، به چند زبان می‌نویسیم و نوشته‌ها را در جمعی همراه به اشتراک می‌گذاریم.",
    location: "پروژه شعر، برلین",
    seoTitle: "شعر فراتر از مرزها – کارگاه",
    seoDescription: "کارگاه شعر چندزبانه در برلین.",
    alt: "فرم‌های کاغذی رنگارنگ که مانند سطرهای شعر روی هم افتاده‌اند",
  },
  uk: {
    title: "Поезія без кордонів",
    description: "Відкрита майстерня про мову, пам’ять і зв’язок.",
    content:
      "Ми читаємо разом, пишемо різними мовами та ділимося текстами в дружньому колі.",
    location: "Поетичний проєкт, Берлін",
    seoTitle: "Поезія без кордонів – майстерня",
    seoDescription: "Багатомовна поетична майстерня в Берліні.",
    alt: "Кольорові паперові форми накладаються, мов поетичні рядки",
  },
  ku: {
    title: "Helbest li Ser Sînoran",
    description: "Atolyeyeke vekirî li ser ziman, bîranîn û têkilî.",
    content:
      "Em bi hev re dixwînin, bi gelek zimanan dinivîsin û nivîsan di derdoreke piştgir de parve dikin.",
    location: "Projeya Helbestê, Berlîn",
    seoTitle: "Helbest li Ser Sînoran – Atolye",
    seoDescription: "Atolyeyeke helbestê ya pirzimanî li Berlînê.",
    alt: "Formên kaxezê yên rengîn wek rêzên helbestê li hev dikevin",
  },
} as const;

export async function seed(payload: Payload, { onlyIfEmpty = false } = {}) {
  const uploadPrefix = `prototype-seed-${randomUUID()}`;
  const upload = payload.collections.media.config.upload;
  if (!upload || typeof upload === "boolean")
    throw new Error("Local media storage is required for the prototype seed.");
  const mediaDirectory = path.resolve(upload.staticDir ?? "media");
  const transactionID = await payload.db.beginTransaction();
  if (transactionID === null)
    throw new Error("Seeding requires PostgreSQL transactions.");
  const req = { transactionID };
  try {
    if (onlyIfEmpty) {
      for (const collection of [
        "authors",
        "media",
        "pages",
        "poems",
        "workshops",
      ] as const) {
        const result = await payload.count({
          collection,
          req,
          overrideAccess: true,
        });
        if (result.totalDocs > 0) {
          await payload.db.commitTransaction(transactionID);
          payload.logger.info(
            "Editorial content exists; automatic demo seeding skipped.",
          );
          return;
        }
      }
    }
    const existingWorkshop = await payload.find({
      req,
      collection: "workshops",
      where: { slug: { equals: "test" } },
      limit: 1,
    });
    if (!existingWorkshop.docs.length) {
      const assetPath = path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "seed-assets/workshop.svg",
      );
      const asset = await readFile(assetPath);
      const media = await payload.create({
        req,
        collection: "media",
        locale: "de",
        data: {
          alt: translations.de.alt,
          credit: "The Poetry Project prototype",
        },
        file: {
          data: asset,
          mimetype: "image/svg+xml",
          name: `${uploadPrefix}.svg`,
          size: asset.byteLength,
        },
      });

      for (const locale of ["en", "ar", "fa", "uk", "ku"] as const) {
        await payload.update({
          req,
          collection: "media",
          id: media.id,
          locale,
          data: { alt: translations[locale].alt },
        });
      }

      const de = translations.de;
      const workshop = await payload.create({
        req,
        collection: "workshops",
        locale: "de",
        data: {
          title: de.title,
          slug: "test",
          description: de.description,
          content: de.content,
          image: media.id,
          startDate: "2026-11-14T13:00:00.000Z",
          endDate: "2026-11-14T16:00:00.000Z",
          location: de.location,
          registrationUrl: "https://example.org/register",
          seo: {
            title: de.seoTitle,
            description: de.seoDescription,
            image: media.id,
          },
          _status: "published",
        },
      });

      for (const locale of ["en", "ar", "fa", "uk", "ku"] as const) {
        const text = translations[locale];
        await payload.update({
          req,
          collection: "workshops",
          id: workshop.id,
          locale,
          data: {
            title: text.title,
            description: text.description,
            content: text.content,
            location: text.location,
            seo: {
              title: text.seoTitle,
              description: text.seoDescription,
              image: media.id,
            },
          },
        });
      }
    }

    const existingPoem = await payload.find({
      req,
      collection: "poems",
      where: { slug: { equals: "test-poem" } },
      limit: 1,
    });
    if (!existingPoem.docs.length) {
      const existingAuthor = await payload.find({
        req,
        collection: "authors",
        where: { name: { equals: "Prototype Collective" } },
        limit: 1,
      });
      const author =
        existingAuthor.docs[0] ??
        (await payload.create({
          req,
          collection: "authors",
          data: { name: "Prototype Collective" },
        }));
      await payload.create({
        req,
        collection: "poems",
        data: {
          title: "صبح مشترک",
          slug: "test-poem",
          originalLanguage: "fa",
          originalText: "صبح از میان پنجره‌های ما می‌گذرد",
          author: author.id,
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
        },
      });
    }

    await payload.db.commitTransaction(transactionID);
    payload.logger.info("Prototype workshop and poem are ready.");
  } catch (error) {
    try {
      await payload.db.rollbackTransaction(transactionID);
    } finally {
      // Database rollback does not remove uploads. Only remove this attempt's files.
      const files = await readdir(mediaDirectory).catch(
        (cause: NodeJS.ErrnoException) => {
          if (cause.code === "ENOENT") return [];
          throw cause;
        },
      );
      await Promise.all(
        files
          .filter((filename) => filename.startsWith(uploadPrefix))
          .map((filename) => rm(path.join(mediaDirectory, filename))),
      );
    }
    throw error;
  }
}
