import { describe, expect, it, vi } from "vitest";
import {
  administrator,
  administratorOrSelf,
  administratorOrEditors,
  authenticated,
  publishedOrAuthenticated,
} from "./access";
import { Users, firstAdministrator } from "./Users";
import configPromise from "../payload.config";

const args = (role?: string, collection = "users") =>
  ({ req: { user: role ? { id: 7, collection, role } : null } }) as never;

describe("MVP permissions", () => {
  it.each(["editor", "admin"])(
    "allows %s to manage editorial content",
    async (role) => {
      expect(await authenticated(args(role))).toBe(true);
      expect(await publishedOrAuthenticated(args(role))).toBe(true);
      expect(await Users.access!.admin!(args(role))).toBe(true);
    },
  );

  it.each([undefined, "contributor", "unknown"])(
    "does not grant editorial access to %s",
    async (role) => {
      expect(await authenticated(args(role))).toBe(false);
      expect(await administrator(args(role))).toBe(false);
      expect(await publishedOrAuthenticated(args(role))).toEqual({
        _status: { equals: "published" },
      });
      expect(await administratorOrSelf(args(role))).toBe(false);
    },
  );

  it("rejects a role on another authentication collection", async () => {
    expect(await authenticated(args("admin", "payload-mcp-api-keys"))).toBe(
      false,
    );
    expect(await administrator(args("admin", "payload-mcp-api-keys"))).toBe(
      false,
    );
  });

  it("lets editors create editor accounts while restricting deletion and role assignment", async () => {
    expect(await administratorOrSelf(args("editor"))).toEqual({
      id: { equals: 7 },
    });
    expect(await administratorOrSelf(args("admin"))).toBe(true);
    expect(await Users.access!.create!(args("editor"))).toBe(true);
    expect(await administratorOrEditors(args("editor"))).toEqual({
      role: { equals: "editor" },
    });
    expect(await administratorOrEditors(args("admin"))).toBe(true);
    expect(await administratorOrEditors(args())).toBe(false);
    for (const operation of ["delete"] as const) {
      expect(await Users.access![operation]!(args("editor"))).toBe(false);
      expect(await Users.access![operation]!(args("admin"))).toBe(true);
    }
    const role = Users.fields.find(
      (field) => "name" in field && field.name === "role",
    );
    if (!role || !("access" in role)) throw new Error("Role field missing");
    for (const operation of ["create", "update"] as const) {
      expect(await role.access![operation]!(args("editor"))).toBe(false);
      expect(await role.access![operation]!(args("admin"))).toBe(true);
    }
  });

  it("defaults to Editor, prevents clearing roles and filters administrator choices for editors", () => {
    const role = Users.fields.find(
      (field) => "name" in field && field.name === "role",
    );
    if (!role || role.type !== "select") throw new Error("Role field missing");
    expect(role).toMatchObject({
      required: true,
      defaultValue: "editor",
      admin: { isClearable: false },
    });
    const options = role.options;
    expect(
      role.filterOptions!({ ...(args("editor") as object), options } as never),
    ).toEqual([options[0]]);
    expect(
      role.filterOptions!({ ...(args("admin") as object), options } as never),
    ).toEqual(options);
    // Payload's first-account setup has no user and assigns Administrator server-side.
    expect(
      role.filterOptions!({ ...(args() as object), options } as never),
    ).toEqual(options);
  });

  it("reserves MCP key management for administrators", async () => {
    const config = await configPromise;
    const keys = config.collections.find(
      ({ slug }) => slug === "payload-mcp-api-keys",
    )!;
    for (const operation of ["create", "read", "update", "delete"] as const) {
      expect(await keys.access[operation]!(args("editor"))).toBe(false);
      expect(await keys.access[operation]!(args("admin"))).toBe(true);
    }
  });

  it("makes the first account an administrator and leaves subsequent roles unchanged", async () => {
    const count = vi
      .fn()
      .mockResolvedValueOnce({ totalDocs: 0 })
      .mockResolvedValueOnce({ totalDocs: 1 });
    const req = { payload: { count } };
    expect(
      await firstAdministrator({
        data: { role: "editor" },
        operation: "create",
        req,
      } as never),
    ).toEqual({ role: "admin" });
    expect(
      await firstAdministrator({
        data: { role: "editor" },
        operation: "create",
        req,
      } as never),
    ).toEqual({ role: "editor" });
    expect(
      await firstAdministrator({
        data: { role: "editor" },
        operation: "update",
        req,
      } as never),
    ).toEqual({ role: "editor" });
    expect(count).toHaveBeenCalledTimes(2);
    expect(count).toHaveBeenCalledWith({
      collection: "users",
      overrideAccess: true,
      req,
    });
  });
});
