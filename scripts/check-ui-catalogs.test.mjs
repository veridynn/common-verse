import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const checker = fileURLToPath(
  new URL("./check-ui-catalogs.mjs", import.meta.url),
);
test("UI catalogs allow visible English fallback but reject messages with no English source", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "poetry-catalog-check-"));
  try {
    await mkdir(path.join(dir, "project.inlang"));
    await mkdir(path.join(dir, "messages"));
    const settings = path.join(dir, "project.inlang/settings.json");
    await writeFile(
      settings,
      JSON.stringify({
        locales: ["en", "ar"],
        "plugin.inlang.messageFormat": {
          pathPattern: "./messages/{locale}.json",
        },
      }),
    );
    await writeFile(
      path.join(dir, "messages/en.json"),
      JSON.stringify({ heading: "Heading" }),
    );
    await writeFile(path.join(dir, "messages/ar.json"), "{}");
    const fallback = spawnSync(process.execPath, [checker, settings], {
      encoding: "utf8",
    });
    assert.equal(fallback.status, 0);
    assert.match(fallback.stderr, /ar: English fallback for heading/);
    await writeFile(
      path.join(dir, "messages/ar.json"),
      JSON.stringify({ typo: "عنوان" }),
    );
    const invalid = spawnSync(process.execPath, [checker, settings], {
      encoding: "utf8",
    });
    assert.notEqual(invalid.status, 0);
    assert.match(invalid.stderr, /Invalid UI message: ar.typo/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
