import "../../src/env";
import { locales } from "@poetry/i18n";
import { getPayload } from "payload";
import config from "../../src/payload.config";
import { homepageContent } from "./homepage-content";

const payload = await getPayload({ config });
try {
  const current = await payload.findGlobal({
    slug: "homepage",
    draft: true,
    depth: 0,
  });
  if (current.createdAt) {
    payload.logger.info(
      "Homepage already exists; editorial content was preserved.",
    );
  } else {
    const [poems, authors, workshops] = await Promise.all([
      payload.find({
        collection: "poems",
        where: { _status: { equals: "published" } },
        limit: 1,
        depth: 0,
      }),
      payload.find({ collection: "authors", limit: 4, depth: 0 }),
      payload.find({
        collection: "workshops",
        where: { _status: { equals: "published" } },
        limit: 1,
        depth: 0,
      }),
    ]);
    const image = workshops.docs[0]?.image;
    for (const locale of locales) {
      const content = homepageContent[locale];
      await payload.updateGlobal({
        slug: "homepage",
        locale,
        draft: false,
        data: {
          _status: "published",
          feature: { ...content.feature, poem: poems.docs[0]?.id },
          sections: content.sections.map((section) => ({
            ...section,
            ...(section.blockType === "introduction" && image ? { image } : {}),
            ...(section.blockType === "poets"
              ? { poets: authors.docs.map((author) => author.id) }
              : {}),
          })),
        },
      });
    }
    payload.logger.info(
      "Homepage initialised in all six languages from the existing published content.",
    );
  }
} finally {
  await payload.destroy();
}
process.exit(0);
