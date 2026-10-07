import "./env";
import { getPayload } from "payload";
import config from "./payload.config";
import { seed } from "./seed";

const args = process.argv.slice(2);
if (args.some((arg) => arg !== "--if-empty"))
  throw new Error("Supported seed option: --if-empty");
if (args.includes("--if-empty") && process.env.NODE_ENV === "production") {
  throw new Error("Automatic demo seeding is disabled in production.");
}
const payload = await getPayload({ config });
try {
  await seed(payload, { onlyIfEmpty: args.includes("--if-empty") });
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await payload.destroy();
}
// Like Payload's CLI, explicitly exit after cleanup: adapter schema introspection
// can retain PostgreSQL handles even after destroy().
process.exit(process.exitCode ?? 0);
