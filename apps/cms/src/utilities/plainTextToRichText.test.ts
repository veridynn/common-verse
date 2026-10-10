import { expect, it } from "vitest";
import { convertLexicalToPlaintext } from "@payloadcms/richtext-lexical/plaintext";
import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";
import { plainTextToRichText } from "./plainTextToRichText";

it.each([
  "",
  "First line\nSecond line\n\nNext paragraph",
  "النص\n\nمتن",
  "<script>alert(1)</script>",
])("preserves imported text and line breaks: %s", (text) => {
  const data = plainTextToRichText(text);
  expect(convertLexicalToPlaintext({ data })).toBe(text);
});

it("escapes imported markup and sanitizes editor links", () => {
  const data = plainTextToRichText("<script>alert(1)</script>");
  expect(convertLexicalToHTML({ data })).not.toContain("<script>");
  const children = [
    {
      type: "link",
      version: 1,
      fields: { linkType: "custom", url: "javascript:alert(1)", newTab: true },
      children: plainTextToRichText("Link").root.children[0].children,
    },
  ];
  const linkedData = {
    root: { ...data.root, children: [{ ...data.root.children[0], children }] },
  };
  const html = convertLexicalToHTML({ data: linkedData });
  expect(html).not.toContain("javascript:");
  expect(html).toContain('rel="noopener noreferrer"');
});
