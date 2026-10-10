import "../../src/env";
import { getPayload } from "payload";
import config from "../../src/payload.config";
import { seedFixedPages } from "./seed-fixed-pages";

if (process.env.NODE_ENV === "production")
  throw new Error(
    "Starting page content must not be imported into production.",
  );
const payload = await getPayload({ config });
try {
  await seedFixedPages(payload);
  payload.logger.info("Imported four fixed pages in German and English.");
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await payload.destroy();
}
process.exit(process.exitCode ?? 0);
