import { Avatar, Style } from "@dicebear/core";
import openPeeps from "@dicebear/styles/open-peeps.json" with { type: "json" };
import type { MediaReference } from "@poetry/types";
import { mediaObject } from "./homepage";

const style = new Style(openPeeps);
// Exact Open Peeps “Bold Pop” preset from the DiceBear playground.
const backgroundColor = ["ff8fab", "ffb703", "4cc9a7", "4d96ff", "b57bff"];

export function generatedPortrait(userId: number | string): string {
  return new Avatar(style, {
    seed: String(userId),
    backgroundColor,
  }).toDataUri();
}

export function personPortrait(
  userId: number | string,
  image?: MediaReference | number | string | null,
) {
  const media = mediaObject(image);
  // Imported demo photographs are superseded by illustrations; keep editorial uploads.
  const demoPhoto =
    media?.url && /(?:^|\/)bulk-demo-v1-commons-portrait-\d+-/.test(media.url);
  if (media && !demoPhoto) {
    return {
      src: new URL(
        media.url!,
        import.meta.env.PUBLIC_CMS_URL ?? "http://localhost:3001",
      ).href,
      alt: media.alt,
    };
  }
  // Decorative next to the person's visible name; avoid announcing a made-up likeness.
  return { src: generatedPortrait(userId), alt: "" };
}
