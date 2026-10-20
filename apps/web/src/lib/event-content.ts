import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";
import type { Event } from "@poetry/types";

const escapeHTML = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!,
  );

export function eventContentHTML(
  content: Event["content"],
  cmsUrl: string,
): string {
  if (!content) return "";
  return convertLexicalToHTML({
    data: content,
    disableContainer: true,
    converters: ({ defaultConverters }) => ({
      ...defaultConverters,
      upload: ({ node }) => {
        const media = node.value;
        if (
          node.relationTo !== "media" ||
          !media ||
          typeof media !== "object" ||
          typeof media.url !== "string" ||
          typeof media.alt !== "string"
        )
          return "";
        let url: URL;
        try {
          url = new URL(media.url, cmsUrl);
        } catch {
          return "";
        }
        if (!["http:", "https:"].includes(url.protocol)) return "";
        const dimensions = ["width", "height"]
          .map((key) =>
            typeof media[key] === "number" &&
            Number.isFinite(media[key]) &&
            media[key] > 0
              ? ` ${key}="${media[key]}"`
              : "",
          )
          .join("");
        return `<figure class="event-content-image"><img src="${escapeHTML(url.href)}" alt="${escapeHTML(media.alt)}"${dimensions} loading="lazy" />${typeof media.credit === "string" && media.credit ? `<figcaption>${escapeHTML(media.credit)}</figcaption>` : ""}</figure>`;
      },
    }),
  });
}
