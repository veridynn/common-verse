import type { Field } from "payload";

/** Keep localized inputs and explicit poem translations independent of editor UI. */
export function contentFields(
  fields: Field[],
  parentLocalized = false,
): Field[] {
  return fields.map((field) => {
    const localized =
      parentLocalized || ("localized" in field && field.localized === true);
    if (
      (field.type === "text" || field.type === "textarea") &&
      (localized || field.custom?.languageField)
    ) {
      const result: Field = { ...field };
      result.admin = { ...result.admin };
      result.admin.components = { ...result.admin.components };
      result.admin.components.Field = {
        path: `./components/ContentField#${field.type === "text" ? "ContentText" : "ContentTextarea"}`,
        clientProps: { languageField: field.custom?.languageField },
      };
      return result;
    }

    if ("fields" in field)
      return { ...field, fields: contentFields(field.fields, localized) };
    if (field.type === "blocks")
      return {
        ...field,
        blocks: field.blocks.map((block) => ({
          ...block,
          fields: contentFields(block.fields, localized),
        })),
      };
    return field;
  });
}
