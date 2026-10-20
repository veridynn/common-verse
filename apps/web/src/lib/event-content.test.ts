import { expect, it } from "vitest";
import { eventContentHTML } from "./event-content";
import type { Event } from "@poetry/types";

function content(value: unknown): Event["content"] {
  const upload = { type: "upload", version: 1, relationTo: "media", value };
  return {
    root: {
      type: "root",
      version: 1,
      direction: null,
      format: "",
      indent: 0,
      children: [upload],
    },
  };
}

it("renders inline CMS images with resolved URLs, dimensions, alt text, and escaped credits", () => {
  const html = eventContentHTML(
    content({
      url: "/api/media/file/poetry.jpg",
      alt: 'A "poetry" & photo',
      width: 800,
      height: 600,
      credit: "Photo <script>alert(1)</script>",
    }),
    "https://cms.example.org",
  );
  expect(html).toContain(
    'src="https://cms.example.org/api/media/file/poetry.jpg"',
  );
  expect(html).toContain('alt="A &quot;poetry&quot; &amp; photo"');
  expect(html).toContain('width="800" height="600"');
  expect(html).toContain('loading="lazy"');
  expect(html).toContain(
    "<figcaption>Photo &lt;script&gt;alert(1)&lt;/script&gt;</figcaption>",
  );
  expect(html).not.toContain("<script>");
});

it("omits missing images and unsafe media URLs without breaking the surrounding text", () => {
  expect(eventContentHTML(null, "https://cms.example.org")).toBe("");
  for (const value of [
    1,
    null,
    { url: "javascript:alert(1)", alt: "test" },
    { url: "https://[invalid", alt: "test" },
  ])
    expect(eventContentHTML(content(value), "https://cms.example.org")).toBe(
      "",
    );
});
