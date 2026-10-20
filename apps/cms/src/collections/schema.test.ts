import { describe, expect, it, vi } from "vitest";
import configPromise from "../payload.config";
import { Authors } from "./Authors";
import { Media } from "./Media";
import { Pages } from "./Pages";
import { Articles } from "./Articles";
import { Users } from "./Users";
import { Poems } from "./Poems";
import { Locations } from "./Locations";
import { Events } from "./Events";
import { authenticated } from "./access";
import { previewEndpoint } from "./preview";

function field(collection: typeof Events, name: string) {
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
      expect.arrayContaining(["media", "authors", "events", "poems"]),
    );
    expect(names).not.toContain("users");
    expect(names).not.toContain("pages");
    expect(names).not.toContain("delete");
  });

  it("requires authentication for editorial mutations and version history", async () => {
    const collections = [
      Articles,
      Authors,
      Media,
      Pages,
      Events,
      Poems,
      Locations,
    ];
    for (const collection of collections) {
      expect(collection.access?.create).toBe(authenticated);
      expect(collection.access?.update).toBe(authenticated);
      expect(collection.access?.delete).toBe(authenticated);
    }
    for (const collection of [Articles, Pages, Events, Poems]) {
      expect(collection.access?.readVersions).toBe(authenticated);
    }
    expect(await authenticated({ req: { user: null } } as never)).toBe(false);
    expect(
      await authenticated({
        req: { user: { id: 1, collection: "users", role: "editor" } },
      } as never),
    ).toBe(true);
  });

  it("keeps contributor accounts out of MVP schemas and hides deferred content", () => {
    expect(Authors.admin?.hidden).toBe(true);
    expect(Poems.admin?.hidden).toBe(true);
    expect(Articles.admin?.hidden).not.toBe(true);
    expect(Articles.labels).toMatchObject({
      singular: { en: "Article" },
      plural: { en: "Articles" },
    });
    expect(field(Articles, "title")).toMatchObject({
      localized: true,
      required: true,
    });
    expect(field(Articles, "content")).toMatchObject({
      type: "richText",
      localized: true,
    });
    expect(field(Articles, "author")).toBeUndefined();
    expect(field(Users, "author")).toBeUndefined();
    expect(field(Users, "role")).toMatchObject({
      options: [
        expect.objectContaining({ value: "editor" }),
        expect.objectContaining({ value: "admin" }),
      ],
    });
  });

  it("localizes event prose while keeping one stable slug", () => {
    expect(field(Events, "title")).toMatchObject({
      localized: true,
      required: true,
    });
    expect(field(Events, "description")).toMatchObject({ localized: true });
    expect(field(Events, "slug")).toMatchObject({
      required: true,
      unique: true,
      admin: { hidden: true },
    });
    expect(field(Events, "slug")).not.toHaveProperty("localized", true);
    expect(Events.versions).toMatchObject({ drafts: expect.any(Object) });
    expect(field(Events, "seo")).toMatchObject({ admin: { hidden: true } });
  });

  it("shows registration below description while retaining other fields", () => {
    const visible = Events.fields.filter(
      (field) =>
        !field.admin || !("hidden" in field.admin) || !field.admin.hidden,
    );
    expect(visible).toEqual([
      field(Events, "title"),
      field(Events, "description"),
      field(Events, "registrationUrl"),
      field(Events, "image"),
      field(Events, "startDate"),
      field(Events, "location"),
    ]);
    expect(field(Events, "description")).toMatchObject({ type: "textarea" });
    expect(field(Events, "image")).toMatchObject({
      type: "upload",
      relationTo: "media",
    });
    expect(field(Events, "startDate")).toMatchObject({
      type: "date",
      required: true,
      admin: { date: { pickerAppearance: "dayAndTime" } },
    });
    expect(field(Events, "content")).toBeDefined();
    expect(
      Events.fields.find((field) => field.type === "collapsible"),
    ).toHaveProperty("admin.hidden", true);
  });

  it("models poem translations as optional explicit records", () => {
    expect(field(Poems, "author")).toMatchObject({
      type: "relationship",
      relationTo: "authors",
      required: true,
    });
    expect(field(Authors, "poems")).toMatchObject({
      type: "join",
      collection: "poems",
      on: "author",
    });
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

  it("uses clear translated collection names and editorial groups", () => {
    expect(Poems.admin?.group).toMatchObject({ en: "Content" });
    expect(Authors.labels?.plural).toMatchObject({ en: "Authors" });
    expect(Events.labels?.plural).toMatchObject({ en: "Events" });
    expect(Events.admin?.group).toMatchObject({ en: "Content" });
    expect(Media.labels?.plural).toMatchObject({ en: "Images & Files" });
    expect(Media.admin?.group).toMatchObject({ en: "Media" });
  });
});

describe("draft preview endpoint", () => {
  it("rejects requests without the shared secret", async () => {
    const endpoint = previewEndpoint("events");
    const response = await endpoint.handler!({
      headers: new Headers(),
      url: "http://localhost/api/events/preview?slug=test&locale=en",
    } as never);
    expect(response.status).toBe(401);
  });

  it("requests the latest draft with access override after authorization", async () => {
    vi.stubEnv("PREVIEW_SECRET", "secret");
    const find = vi.fn().mockResolvedValue({ docs: [{ id: 1 }] });
    const endpoint = previewEndpoint("events");
    const response = await endpoint.handler!({
      headers: new Headers({ "x-preview-secret": "secret" }),
      url: "http://localhost/api/events/preview?slug=test&locale=ar",
      payload: { find },
    } as never);

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "events",
        draft: true,
        overrideAccess: true,
        locale: "ar",
        where: { slug: { equals: "test" } },
      }),
    );
    vi.unstubAllEnvs();
  });
});
