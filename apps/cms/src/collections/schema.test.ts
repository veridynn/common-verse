import { describe, expect, it, vi } from "vitest";
import configPromise from "../payload.config";
import { Authors } from "./Authors";
import { Media } from "./Media";
import { Pages } from "./Pages";
import { Poems } from "./Poems";
import { Workshops } from "./Workshops";
import { authenticated } from "./access";
import { previewEndpoint } from "./preview";

function field(collection: typeof Workshops, name: string) {
  return collection.fields.find(
    (candidate) => "name" in candidate && candidate.name === name,
  );
}

describe("editorial schemas", () => {
  it("registers a scoped Payload MCP endpoint without exposing users or deletes", async () => {
    const config = await configPromise;
    const mcpKeys = config.collections?.find(
      (collection) => collection.slug === "payload-mcp-api-keys",
    );
    expect(mcpKeys).toBeDefined();
    expect(config.endpoints).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "/mcp" })]),
    );

    const names: string[] = [];
    const collectNames = (value: unknown) => {
      if (Array.isArray(value)) return value.forEach(collectNames);
      if (!value || typeof value !== "object") return;
      const record = value as Record<string, unknown>;
      if (typeof record.name === "string") names.push(record.name);
      Object.values(record).forEach(collectNames);
    };
    collectNames(mcpKeys?.fields);
    expect(names).toEqual(
      expect.arrayContaining([
        "media",
        "pages",
        "authors",
        "workshops",
        "poems",
      ]),
    );
    expect(names).not.toContain("users");
    expect(names).not.toContain("delete");
  });

  it("requires authentication for editorial mutations and version history", async () => {
    const collections = [Authors, Media, Pages, Workshops, Poems];
    for (const collection of collections) {
      expect(collection.access?.create).toBe(authenticated);
      expect(collection.access?.update).toBe(authenticated);
      expect(collection.access?.delete).toBe(authenticated);
    }
    for (const collection of [Pages, Workshops, Poems]) {
      expect(collection.access?.readVersions).toBe(authenticated);
    }
    expect(await authenticated({ req: { user: null } } as never)).toBe(false);
    expect(await authenticated({ req: { user: { id: 1 } } } as never)).toBe(
      true,
    );
  });

  it("localizes workshop prose while keeping one stable slug", () => {
    expect(field(Workshops, "title")).toMatchObject({
      localized: true,
      required: true,
    });
    expect(field(Workshops, "description")).toMatchObject({ localized: true });
    expect(field(Workshops, "slug")).toMatchObject({
      required: true,
      unique: true,
    });
    expect(field(Workshops, "slug")).not.toHaveProperty("localized", true);
    expect(Workshops.versions).toMatchObject({ drafts: expect.any(Object) });
  });

  it("models poem translations as optional explicit records", () => {
    expect(field(Poems, "originalLanguage")).toMatchObject({
      type: "select",
      required: true,
    });
    expect(field(Poems, "originalText")).toMatchObject({
      type: "textarea",
      required: true,
    });
    expect(field(Poems, "translations")).toMatchObject({ type: "array" });
    expect(field(Poems, "translations")).not.toHaveProperty("localized", true);
  });
});

describe("draft preview endpoint", () => {
  it("rejects requests without the shared secret", async () => {
    const endpoint = previewEndpoint("workshops");
    const response = await endpoint.handler!({
      headers: new Headers(),
      url: "http://localhost/api/workshops/preview?slug=test&locale=en",
    } as never);
    expect(response.status).toBe(401);
  });

  it("requests the latest draft with access override after authorization", async () => {
    vi.stubEnv("PREVIEW_SECRET", "secret");
    const find = vi.fn().mockResolvedValue({ docs: [{ id: 1 }] });
    const endpoint = previewEndpoint("workshops");
    const response = await endpoint.handler!({
      headers: new Headers({ "x-preview-secret": "secret" }),
      url: "http://localhost/api/workshops/preview?slug=test&locale=ar",
      payload: { find },
    } as never);

    expect(response.status).toBe(200);
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "workshops",
        draft: true,
        overrideAccess: true,
        locale: "ar",
        where: { slug: { equals: "test" } },
      }),
    );
    vi.unstubAllEnvs();
  });
});
