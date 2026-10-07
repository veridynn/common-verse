import path from "node:path";
import { createRequire } from "node:module";
import { checkPort, options, root, run, setup } from "./setup.mjs";

const controller = new AbortController();
try {
  const config = options(process.argv.slice(2));
  await Promise.all([checkPort(4321), checkPort(3001)]);
  await setup(config);
  console.log(
    "\nWebsite: http://localhost:4321\nAdmin: http://localhost:3001/admin",
  );
  console.log(
    "Create the first admin account in the browser. Ctrl+C stops both apps; PostgreSQL persists.\n",
  );
  process.env.ASTRO_DEV_BACKGROUND = "0";
  const web = path.join(root, "apps/web");
  const cms = path.join(root, "apps/cms");
  const webRequire = createRequire(path.join(web, "package.json"));
  const cmsRequire = createRequire(path.join(cms, "package.json"));
  const astro = path.join(
    path.dirname(webRequire.resolve("astro/package.json")),
    "bin/astro.mjs",
  );
  const next = path.join(
    path.dirname(cmsRequire.resolve("next/package.json")),
    "dist/bin/next",
  );
  const managed = { managed: true, signal: controller.signal };
  await Promise.all([
    run(process.execPath, [astro, "dev"], web, managed).finally(() =>
      controller.abort(),
    ),
    run(
      process.execPath,
      [next, "dev", "--port", "3001"],
      cms,
      managed,
    ).finally(() => controller.abort()),
  ]);
} catch (error) {
  console.error(`Startup failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  controller.abort();
}
