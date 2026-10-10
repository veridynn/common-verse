import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { compile } from "@inlang/paraglide-js";

test("missing UI translations compile to English in both catalog configurations", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "poetry-ui-fallback-"));
  try {
    for (const [index, settingsPath] of [
      new URL("../project.inlang/settings.json", import.meta.url),
      new URL(
        "../../../apps/web/project.inlang/settings.json",
        import.meta.url,
      ),
    ].entries()) {
      const settings = JSON.parse(await readFile(settingsPath));
      assert.equal(settings.baseLocale, "en");
      const dir = path.join(root, String(index));
      await mkdir(path.join(dir, "project.inlang"), { recursive: true });
      await mkdir(path.join(dir, "messages"));
      await writeFile(
        path.join(dir, "messages/en.json"),
        JSON.stringify({ fallback_probe: "English fallback" }),
      );
      for (const locale of settings.locales.filter(
        (locale) => locale !== "en",
      )) {
        await writeFile(path.join(dir, `messages/${locale}.json`), "{}");
      }
      await writeFile(
        path.join(dir, "project.inlang/settings.json"),
        JSON.stringify({
          ...settings,
          modules: [
            path.relative(
              dir,
              fileURLToPath(
                import.meta.resolve("@inlang/plugin-message-format"),
              ),
            ),
          ],
        }),
      );
      await compile({
        project: path.join(dir, "project.inlang"),
        outdir: path.join(dir, "out"),
        strategy: ["baseLocale"],
      });
      const messages = await import(
        pathToFileURL(path.join(dir, "out/messages.js")).href
      );
      for (const locale of settings.locales)
        assert.equal(
          messages.fallback_probe({}, { locale }),
          "English fallback",
        );
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
