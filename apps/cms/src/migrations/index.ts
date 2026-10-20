import * as fixedPageRichText from "./20261010_fixed_page_rich_text";

import * as blogPosts from "./20261010_blog_posts";

import * as editorialNames from "./20261010_editorial_names";

import * as eventEditor from "./20261015_event_editor";

export const migrations = [
  { name: "20261010_fixed_page_rich_text", ...fixedPageRichText },
  { name: "20261010_blog_posts", ...blogPosts },
  { name: "20261010_editorial_names", ...editorialNames },
  { name: "20261015_event_editor", ...eventEditor },
];
