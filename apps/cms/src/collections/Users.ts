import { label, message } from "@poetry/cms-ui";
import type { PostgresAdapter } from "@payloadcms/db-postgres";
import { APIError } from "payload";
import type {
  CollectionConfig,
  CollectionBeforeValidateHook,
  PayloadRequest,
} from "payload";
import {
  administrator,
  administratorOrSelf,
  administratorOrEditors,
  authenticated,
  isEditor,
  isAdministrator,
} from "./access";

export const firstAdministrator: CollectionBeforeValidateHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation === "create" && data) {
    const { totalDocs } = await req.payload.count({
      collection: "users",
      overrideAccess: true,
      req,
    });
    if (totalDocs === 0) data.role = "admin";
  }
  return data;
};

async function lockAdministratorChanges(req: PayloadRequest) {
  const transactionID = await req.transactionID;
  if (!transactionID)
    throw new APIError("Account changes require a transaction.", 500);
  const db = req.payload.db as Pick<PostgresAdapter, "execute" | "sessions">;
  // Serialize removals until commit, including simultaneous administrator demotions.
  await db.execute({
    db: db.sessions[transactionID].db,
    raw: "SELECT pg_advisory_xact_lock(734021, 1)",
  });
}

async function requireAdministrator(req: PayloadRequest) {
  const { totalDocs } = await req.payload.count({
    collection: "users",
    where: { role: { equals: "admin" } },
    overrideAccess: true,
    req,
  });
  if (totalDocs === 0) {
    throw new APIError(
      message("last_administrator_required", req.i18n?.language),
      409,
    );
  }
}

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: label("user"), plural: label("users") },

  auth: true,
  admin: {
    useAsTitle: "email",
    group: label("administration"),
  },
  access: {
    admin: ({ req }) => isEditor(req),
    create: authenticated,
    read: administratorOrEditors,
    update: administratorOrSelf,
    delete: administrator,
  },
  hooks: {
    beforeValidate: [firstAdministrator],
    beforeChange: [
      async ({ data, originalDoc, operation, req }) => {
        if (
          operation === "update" &&
          originalDoc.role === "admin" &&
          data.role !== undefined &&
          data.role !== "admin"
        ) {
          await lockAdministratorChanges(req);
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (
          operation === "update" &&
          previousDoc.role === "admin" &&
          doc.role !== "admin"
        ) {
          await requireAdministrator(req);
        }
        return doc;
      },
    ],
    beforeDelete: [
      async ({ req }) => {
        await lockAdministratorChanges(req);
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        if (doc.role === "admin") await requireAdministrator(req);
        return doc;
      },
    ],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: label("display_name"),
    },
    {
      name: "role",
      label: label("role"),
      type: "select",
      required: true,
      defaultValue: "editor",
      admin: {
        isClearable: false,
        components: { Field: "./components/RoleField#RoleField" },
      },
      filterOptions: ({ options, req }) =>
        !req.user || isAdministrator(req)
          ? options
          : options.filter(
              (option) =>
                typeof option !== "string" && option.value === "editor",
            ),
      access: {
        create: ({ req }) => isAdministrator(req),
        update: async ({ req, doc, id }) => {
          if (!isAdministrator(req)) return false;
          const userID = id ?? doc?.id;
          if (doc?.role !== "admin" || userID === undefined) return true;
          const { totalDocs } = await req.payload.count({
            collection: "users",
            where: {
              and: [
                { role: { equals: "admin" } },
                { id: { not_equals: userID } },
              ],
            },
            overrideAccess: true,
            req,
          });
          return totalDocs > 0;
        },
      },
      options: [
        { label: label("editor"), value: "editor" },
        { label: label("administrator"), value: "admin" },
      ],
    },
  ],
};
