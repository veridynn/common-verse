import { expect, it, vi } from "vitest";
import {
  createEditor,
  $getRoot,
  $createParagraphNode,
  $createTextNode,
} from "@payloadcms/richtext-lexical/lexical";
import { HorizontalRuleNode } from "@payloadcms/richtext-lexical/client";

vi.mock("@payloadcms/ui", () => ({ useTranslation: vi.fn() }));
// Use the installed node without loading Payload's unrelated browser UI bundle.
vi.mock("@payloadcms/richtext-lexical/client", async () => {
  const { createRequire } = await import("node:module");
  const { dirname, resolve } = await import("node:path");
  const require = createRequire(import.meta.url);
  const dist = dirname(require.resolve("@payloadcms/richtext-lexical"));
  return import(
    resolve(dist, "features/horizontalRule/client/nodes/HorizontalRuleNode.js")
  );
});
import "./EventFields";

it("imports pasted horizontal rules as the registered client node and allows subsequent edits", () => {
  const errors: Error[] = [];
  const editor = createEditor({
    nodes: [HorizontalRuleNode],
    onError: (error) => errors.push(error),
  });
  editor.update(
    () => {
      const conversion = HorizontalRuleNode.importDOM()!.hr(documentStub)!;
      const imported = conversion.conversion(documentStub)!.node;
      if (Array.isArray(imported) || !imported)
        throw new Error("Expected a horizontal rule node");
      $getRoot().append(imported);
    },
    { discrete: true },
  );
  expect(errors).toEqual([]);
  editor.update(
    () => {
      $getRoot().append(
        $createParagraphNode().append($createTextNode("Continue writing")),
      );
    },
    { discrete: true },
  );
  expect(errors).toEqual([]);
  expect(editor.getEditorState().toJSON().root.children[0].type).toBe(
    "horizontalrule",
  );
  expect(
    editor.getEditorState().read(() => $getRoot().getTextContent()),
  ).toContain("Continue writing");
});
const documentStub = {} as HTMLElement;
