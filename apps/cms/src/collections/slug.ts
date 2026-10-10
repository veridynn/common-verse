import { message } from "@poetry/cms-ui";
import type { TextFieldSingleValidation } from "payload";
import { text } from "payload/shared";

export const validPublicSlug: TextFieldSingleValidation = async (
  value,
  options,
) => {
  const validation = await text(value, options);
  if (validation !== true) return validation;
  // Preserve existing URLs, including legacy non-ASCII slugs, unless explicitly changed.
  if (value === options.previousValue || /^[A-Za-z0-9_-]+$/.test(value ?? ""))
    return true;
  return message("slug_format", options.req.i18n.language);
};
