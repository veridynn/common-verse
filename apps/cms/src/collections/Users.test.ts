import { describe, expect, it, vi } from "vitest";
import { Users } from "./Users";

const hooks = Users.hooks!;
const request = (administrators: number) => ({
  transactionID: Promise.resolve("test"),
  i18n: { language: "en" },
  payload: {
    count: vi.fn().mockResolvedValue({ totalDocs: administrators }),
    db: { sessions: { test: { db: {} } }, execute: vi.fn() },
  },
});

describe("last administrator protection", () => {
  it("makes the native role selector read-only for the last administrator", async () => {
    const role = Users.fields.find(
      (field) => "name" in field && field.name === "role",
    );
    if (!role || role.type !== "select") throw new Error("Role field missing");
    for (const administrators of [0, 1]) {
      const req = {
        ...request(administrators),
        user: { collection: "users", role: "admin" },
      };
      expect(
        await role.access!.update!({
          req,
          doc: { id: 7, role: "admin" },
        } as never),
      ).toBe(administrators > 0);
      expect(req.payload.count).toHaveBeenCalledWith({
        collection: "users",
        where: {
          and: [{ role: { equals: "admin" } }, { id: { not_equals: 7 } }],
        },
        overrideAccess: true,
        req,
      });
    }
  });

  it("locks demotions in the request transaction, without locking profile edits", async () => {
    const req = request(0);
    for (const data of [
      { name: "Updated" },
      { role: "admin" },
      { role: "editor" },
    ]) {
      await hooks.beforeChange![0]({
        data,
        originalDoc: { role: "admin" },
        operation: "update",
        req,
      } as never);
    }
    expect(req.payload.db.execute).toHaveBeenCalledExactlyOnceWith({
      db: req.payload.db.sessions.test.db,
      raw: "SELECT pg_advisory_xact_lock(734021, 1)",
    });
  });

  it.each(["demote", "delete"])(
    "rejects the last administrator's %s and permits it when another remains",
    async (operation) => {
      for (const administrators of [0, 1]) {
        const req = request(administrators);
        const result =
          operation === "demote"
            ? hooks.afterChange![0]({
                doc: { role: "editor" },
                previousDoc: { role: "admin" },
                operation: "update",
                req,
              } as never)
            : hooks.afterDelete![0]({ doc: { role: "admin" }, req } as never);
        if (administrators === 0) {
          await expect(result).rejects.toMatchObject({
            status: 409,
            message: expect.stringContaining(
              "Make another user an Administrator first",
            ),
          });
        } else {
          await expect(result).resolves.toBeDefined();
        }
        expect(req.payload.count).toHaveBeenCalledWith({
          collection: "users",
          where: { role: { equals: "admin" } },
          overrideAccess: true,
          req,
        });
      }
    },
  );

  it("does not restrict editor deletion or normal profile changes", async () => {
    const req = request(0);
    await hooks.afterDelete![0]({ doc: { role: "editor" }, req } as never);
    await hooks.afterChange![0]({
      doc: { role: "admin" },
      previousDoc: { role: "admin" },
      operation: "update",
      req,
    } as never);
    expect(req.payload.count).not.toHaveBeenCalled();
  });

  it("fails closed when account removal has no transaction", async () => {
    await expect(
      hooks.beforeDelete![0]({ req: { transactionID: undefined } } as never),
    ).rejects.toMatchObject({ status: 500 });
  });
});
