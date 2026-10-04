import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

const dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(dirname, "../../../.env") });
