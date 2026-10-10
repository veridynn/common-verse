import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

export function plainTextToRichText(text: string) {
  return {
    root: {
      type: "root",
      version: 1,
      direction: null,
      format: "",
      indent: 0,
      children: text.split(/\n\n/).map((paragraph) => ({
        type: "paragraph",
        version: 1,
        direction: null,
        format: "",
        indent: 0,
        children: paragraph.split("\n").flatMap((line, index) => [
          ...(index ? [{ type: "linebreak", version: 1 }] : []),
          {
            type: "text",
            version: 1,
            text: line,
            format: 0,
            detail: 0,
            mode: "normal",
            style: "",
          },
        ]),
      })),
    },
  } satisfies SerializedEditorState;
}
