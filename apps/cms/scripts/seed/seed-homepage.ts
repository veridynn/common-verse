import "../../src/env";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { locales } from "@poetry/i18n";
import { getPayload } from "payload";
import config from "../../src/payload.config";

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
      const messages = JSON.parse(
        await readFile(
          path.resolve(
            path.dirname(fileURLToPath(import.meta.url)),
            `../../../web/messages/${locale}.json`,
          ),
          "utf8",
        ),
      ) as Record<string, string>;
      await payload.updateGlobal({
        slug: "homepage",
        locale,
        draft: false,
        data: {
          _status: "published",
          feature: {
            kind: "poem",
            heading: messages.home_heading,
            description: messages.home_intro,
            poem: poems.docs[0]?.id,
          },
          sections: [
            {
              id: "homepage-intro",
              blockType: "introduction",
              heading: messages.home_about_heading,
              description: messages.home_about_description,
              ...(image ? { image } : {}),
              linkLabel: messages.home_contact,
              linkUrl: "https://thepoetryproject.de/kontakt",
            },
            {
              id: "homepage-poets",
              blockType: "poets",
              enabled: true,
              heading: messages.home_poets_heading,
              description: messages.home_poets_description,
              poets: authors.docs.map((author) => author.id),
            },
            {
              id: "homepage-events",
              blockType: "events",
              enabled: true,
              heading: messages.home_events_heading,
              description: messages.home_events_description,
              limit: 3,
            },
            {
              id: "homepage-participation",
              blockType: "participation",
              enabled: true,
              heading: messages.home_participation_heading,
              links: [
                {
                  id: "homepage-write",
                  title: messages.home_write,
                  description: messages.home_write_description,
                  url: "/workshops",
                },
                {
                  id: "homepage-invite",
                  title: messages.home_invite,
                  description: messages.home_invite_description,
                  url: "https://thepoetryproject.de/bildung/schule",
                },
                {
                  id: "homepage-support",
                  title: messages.home_support,
                  description: messages.home_support_description,
                  url: "https://thepoetryproject.de/spenden",
                },
              ],
            },
            {
              id: "homepage-newsletter",
              blockType: "newsletter",
              enabled: true,
              heading: messages.home_newsletter_heading,
              description: messages.home_newsletter_description,
              linkLabel: messages.home_newsletter_action,
              linkUrl: "https://thepoetryproject.de/newsletter",
            },
          ],
          seo: {
            title: messages.site_title,
            description: messages.site_description,
          },
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
