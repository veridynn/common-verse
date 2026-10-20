import type {
  CollectionBeforeValidateHook,
  PayloadRequest,
  NumberFieldSingleValidation,
} from "payload";
import { message } from "@poetry/cms-ui";
import { number, slugify } from "payload/shared";

export const eventSlug = async ({
  valueToSlugify,
  data,
  req,
}: {
  valueToSlugify?: unknown;
  data: { id?: string | number };
  req: PayloadRequest;
}) => {
  const base =
    slugify(
      typeof valueToSlugify === "string"
        ? valueToSlugify.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
        : "",
    ) || "event";
  let slug = base;
  for (let suffix = 2; ; suffix++) {
    const result = await req.payload.find({
      collection: "events",
      where: {
        and: [
          { slug: { equals: slug } },
          ...(data.id ? [{ id: { not_equals: data.id } }] : []),
        ],
      },
      limit: 1,
      depth: 0,
      draft: true,
      overrideAccess: false,
      req,
    });
    if (!result.docs.length) return slug;
    slug = `${base}-${suffix}`;
  }
};

export const prepareEvent: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (!data) return data;
  if (
    !data.slug &&
    !originalDoc?.slug &&
    typeof data.title === "string" &&
    data.title.trim()
  ) {
    data.slug = await eventSlug({
      data: { ...data, id: originalDoc?.id },
      req,
      valueToSlugify: data.title,
    });
  }
  data.kind ??= originalDoc?.kind ?? "workshop";
  if (data.kind === "workshop") data.price = null;
  return data;
};

export const validEventPrice: NumberFieldSingleValidation = async (
  value,
  options,
) => {
  const result = await number(value, options);
  if (result !== true) return result;
  if (
    value != null &&
    (!Number.isFinite(value) || value !== Number(value.toFixed(2)))
  )
    return message("price_format", options.req.i18n.language);
  return true;
};
