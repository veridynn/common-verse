import { createElement, isValidElement } from "react";
import { expect, it, vi } from "vitest";
import { orderNavigation } from "./Nav";

vi.mock("@payloadcms/next/rsc", () => ({ DefaultNav: vi.fn() }));

it.each([
  ["Content", "Media", "Administration", "Pages"],
  ["المحتوى", "الوسائط", "الإدارة", "الصفحات"],
])(
  "orders groups and entries independently of %s labels",
  (content, media, administration, pages) => {
    const groups = [
      {
        label: pages,
        entities: [
          { slug: "legal" },
          { slug: "contact" },
          { slug: "homepage" },
          { slug: "privacy" },
          { slug: "about" },
        ],
      },
      { label: administration, entities: [{ slug: "users" }] },
      { label: media, entities: [{ slug: "media" }] },
      {
        label: content,
        entities: [{ slug: "events" }, { slug: "authors" }, { slug: "poems" }],
      },
    ];
    const controls = createElement("button", { id: "logout" });
    const tree = createElement(
      "nav",
      null,
      createElement("div", { groups, navPreferences: { open: true } }),
      controls,
    );
    const ordered = orderNavigation(tree);
    if (!isValidElement<{ children: (typeof tree)[] }>(ordered))
      throw new Error("Missing navigation");
    const props = ordered.props.children[0].props as {
      groups: typeof groups;
      navPreferences: object;
    };
    expect(props.groups.map(({ label }) => label)).toEqual([
      content,
      media,
      administration,
      pages,
    ]);
    expect(
      props.groups.flatMap(({ entities }) => entities.map(({ slug }) => slug)),
    ).toEqual([
      "events",
      "poems",
      "authors",
      "media",
      "users",
      "homepage",
      "about",
      "contact",
      "privacy",
      "legal",
    ]);
    expect(props.navPreferences).toEqual({ open: true });
    expect(ordered.props.children[1].props).toEqual(controls.props);
    expect(groups[0].entities[0].slug).toBe("legal");
  },
);

it("preserves permission-filtered entries and leaves unfamiliar entities available", () => {
  const groups = [
    { label: "Tools", entities: [{ slug: "plugin" }] },
    { label: "Pages", entities: [{ slug: "contact" }] },
  ];
  const ordered = orderNavigation(createElement("div", { groups }));
  if (!isValidElement<{ groups: typeof groups }>(ordered))
    throw new Error("Missing navigation");
  expect(ordered.props.groups).toEqual([groups[1], groups[0]]);
});
