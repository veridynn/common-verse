"use client";

import { useTranslation } from "@payloadcms/ui";
import { message } from "@poetry/cms-ui";
import { useEffect } from "react";

export function EditorAccessibility() {
  const { i18n, t } = useTranslation();
  useEffect(() => {
    const form = document.querySelector("main form");
    if (!form) return;
    // Payload 3.90 renders its formatting icons without accessible names or states.
    const updateLabels = () => {
      const editor = form.querySelector(".event-editor-content");
      if (!editor) return;
      const labels: Record<string, string> = {
        bold: message("editor_bold", i18n.language),
        italic: message("editor_italic", i18n.language),
        underline: message("editor_underline", i18n.language),
        strikethrough: message("editor_strikethrough", i18n.language),
        indentDecrease: message("editor_indent_less", i18n.language),
        indentIncrease: message("editor_indent_more", i18n.language),
        link: message("editor_link", i18n.language),
        add: t("fields:addNew"),
        text: message("editor_text_style", i18n.language),
        align: message("editor_alignment", i18n.language),
      };
      editor
        .querySelectorAll<HTMLButtonElement>(
          "button[data-button-key], button[data-dropdown-key]",
        )
        .forEach((button) => {
          const key = button.dataset.buttonKey ?? button.dataset.dropdownKey!;
          if (!labels[key]) return;
          button.setAttribute("aria-label", labels[key]);
          button.title = labels[key];
          if (["bold", "italic", "underline", "strikethrough"].includes(key))
            button.setAttribute(
              "aria-pressed",
              String(button.classList.contains("active")),
            );
          if (button.dataset.buttonKey)
            button.disabled = button.classList.contains("disabled");
        });
      for (const [selector, label] of [
        [
          ".LexicalEditorTheme__upload__swap-drawer-toggler",
          t("fields:swapUpload"),
        ],
        [".LexicalEditorTheme__upload__removeButton", t("fields:removeUpload")],
      ]) {
        editor
          .querySelectorAll(selector)
          .forEach((button) => button.setAttribute("aria-label", label));
      }
    };
    updateLabels();
    const observer = new MutationObserver(updateLabels);
    observer.observe(form, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [i18n.language, t]);
  return null;
}
