import "../../src/env";
import { getPayload } from "payload";
import config from "../../src/payload.config";
import { seed } from "./seed";

const args = process.argv.slice(2);
if (args.some((arg) => !["--if-empty", "--bulk", "--photos"].includes(arg)))
  throw new Error("Supported seed options: --if-empty or --bulk [--photos]");
if (args.includes("--if-empty") && process.env.NODE_ENV === "production") {
  throw new Error("Automatic demo seeding is disabled in production.");
}
if (args.includes("--bulk") && args.includes("--if-empty"))
  throw new Error("Use --bulk separately from automatic --if-empty seeding.");
if (args.includes("--photos") && !args.includes("--bulk"))
  throw new Error("Photo imports require --bulk --photos.");
const bulk = args.includes("--bulk") ? await import("./seed-bulk") : undefined;
bulk?.assertBulkSeedEnvironment();
const payload = await getPayload({ config });
try {
  if (bulk) await bulk.seedBulk(payload);
  else await seed(payload, { onlyIfEmpty: args.includes("--if-empty") });
  if (args.includes("--photos")) {
    const { seedEventPhotos } = await import("./seed-event-photos");
    await seedEventPhotos(payload);
  }
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await payload.destroy();
}
// Like Payload's CLI, explicitly exit after cleanup: adapter schema introspection
// can retain PostgreSQL handles even after destroy().
process.exit(process.exitCode ?? 0);
