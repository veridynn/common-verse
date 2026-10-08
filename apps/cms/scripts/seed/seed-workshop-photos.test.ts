import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { Payload } from "payload";
import { afterEach, describe, expect, it, vi } from "vitest";
import { parseEventPhoto, seedWorkshopPhotos } from "./seed-workshop-photos";

const directories: string[] = [];
afterEach(async () => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  await Promise.all(
    directories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});
function source(index = 1) {
  return {
    title: `File:Poetry reading ${index}.jpg`,
    imageinfo: [
      {
        mime: "image/jpeg",
        thumburl: `https://upload.wikimedia.org/photo-${index}.jpg`,
        descriptionurl: `https://commons.wikimedia.org/wiki/File:Poetry_${index}.jpg`,
        extmetadata: {
          Artist: { value: "<b>Example &amp; Photographer</b>" },
          LicenseShortName: { value: "CC BY-SA 4.0" },
          LicenseUrl: {
            value: "https://creativecommons.org/licenses/by-sa/4.0",
          },
        },
      },
    ],
  };
}
async function fixture(cached = false) {
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv(
    "DATABASE_URL",
    "postgresql://poetry:poetry@localhost:5432/poetry",
  );
  const directory = await mkdtemp(path.join(tmpdir(), "poetry-photos-"));
  directories.push(directory);
  const fetchMock = vi.fn(async (url: string) =>
    url.includes("api.php")
      ? new Response(
          JSON.stringify({
            query: {
              pages: Array.from({ length: 12 }, (_, i) => source(i + 1)),
            },
          }),
        )
      : new Response(new Uint8Array([0xff, 0xd8, 0xff]), {
          headers: { "content-type": "image/jpeg" },
        }),
  );
  vi.stubGlobal("fetch", fetchMock);
  const payload = {
    collections: { media: { config: { upload: { staticDir: directory } } } },
    db: {
      beginTransaction: vi.fn().mockResolvedValue("photos-transaction"),
      commitTransaction: vi.fn(),
      rollbackTransaction: vi.fn(),
    },
    logger: { info: vi.fn() },
    find: vi.fn(async ({ collection, where }) => {
      if (collection === "workshops")
        return { docs: [{ id: 20, image: 30, _status: "draft" }] };
      if (where.id) return { docs: [{ id: 30, credit: "bulk-demo-v1-art-1" }] };
      return { docs: cached ? [{ id: 100 }] : [] };
    }),
    create: vi.fn(async ({ file }) => {
      await writeFile(path.join(directory, file.name), file.data);
      return { id: 100 };
    }),
    update: vi.fn(
      async (_args: {
        collection: string;
        data: unknown;
        req: unknown;
      }) => ({}),
    ),
  };
  return {
    directory,
    payload,
    fetchMock,
    run: () => seedWorkshopPhotos(payload as unknown as Payload),
  };
}

describe("licensed workshop photo import", () => {
  it("extracts plain-text credit and rejects missing licensing and untrusted URLs", () => {
    expect(parseEventPhoto(source())?.artist).toBe("Example & Photographer");
    const missing = source();
    missing.imageinfo[0].extmetadata.LicenseShortName.value =
      "All rights reserved";
    expect(parseEventPhoto(missing)).toBeNull();
    const unsafe = source();
    unsafe.imageinfo[0].thumburl = "http://localhost/private";
    expect(parseEventPhoto(unsafe)).toBeNull();
  });
  it("imports multilingual photos and preserves workshop draft status", async () => {
    const f = await fixture();
    expect(await f.run()).toEqual({ imported: 12, attached: 75 });
    expect(f.fetchMock).toHaveBeenCalledTimes(13);
    const attachments = f.payload.update.mock.calls
      .map(([args]) => args)
      .filter((args) => args.collection === "workshops");
    expect(attachments).toHaveLength(75);
    for (const args of attachments)
      expect(args.data).toEqual({ image: 100, _status: "draft" });
    expect(f.payload.db.commitTransaction).toHaveBeenCalledWith(
      "photos-transaction",
    );
  });
  it("uses saved photos without network requests and preserves editor-selected media", async () => {
    const f = await fixture(true);
    f.payload.find.mockImplementation(async ({ collection, where }) => {
      if (collection === "workshops")
        return { docs: [{ id: 20, image: 30, _status: "published" }] };
      if (where.id) return { docs: [{ id: 30, credit: "Editor photo" }] };
      return { docs: [{ id: 100 }] };
    });
    expect(await f.run()).toEqual({ imported: 0, attached: 0 });
    expect(f.fetchMock).not.toHaveBeenCalled();
    expect(f.payload.update).not.toHaveBeenCalled();
  });
  it("stops on API failure before starting a transaction", async () => {
    const f = await fixture();
    f.fetchMock.mockResolvedValueOnce(
      new Response("Rate limited", { status: 429 }),
    );
    await expect(f.run()).rejects.toThrow("429");
    expect(f.payload.db.beginTransaction).not.toHaveBeenCalled();
    expect(f.payload.create).not.toHaveBeenCalled();
  });
  it("rolls back and cleans only files from a failed import", async () => {
    const f = await fixture();
    await writeFile(path.join(f.directory, "editor.jpg"), "preserve");
    f.payload.update.mockRejectedValueOnce(new Error("Translation failed"));
    await expect(f.run()).rejects.toThrow("Translation failed");
    expect(f.payload.db.rollbackTransaction).toHaveBeenCalledWith(
      "photos-transaction",
    );
    expect(f.payload.db.commitTransaction).not.toHaveBeenCalled();
    expect(await readdir(f.directory)).toEqual(["editor.jpg"]);
  });
});
