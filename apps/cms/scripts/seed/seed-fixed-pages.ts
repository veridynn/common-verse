import { fixedPageKeys } from "@poetry/i18n";
import type { Payload } from "payload";
import { fixedPagesContent } from "./fixed-pages-content";
import { plainTextToRichText } from "../../src/utilities/plainTextToRichText";

export async function seedFixedPages(payload: Payload) {
  const transactionID = await payload.db.beginTransaction();
  if (transactionID === null)
    throw new Error("Page import requires a transaction.");
  const req = { transactionID };
  try {
    for (const slug of fixedPageKeys) {
      for (const locale of ["de", "en"] as const) {
        await payload.updateGlobal({
          slug,
          locale,
          req,
          overrideAccess: true,
          draft: false,
          data: {
            ...fixedPagesContent[slug][locale],
            content: plainTextToRichText(
              fixedPagesContent[slug][locale].content,
            ),
            _status: "published",
          },
        });
      }
    }
    await payload.db.commitTransaction(transactionID);
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID);
    throw error;
  }
}
