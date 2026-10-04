import type { Endpoint } from "payload";

type PreviewCollection = "workshops" | "poems";

export function previewEndpoint(collection: PreviewCollection): Endpoint {
  return {
    path: "/preview",
    method: "get",
    handler: async (req) => {
      if (
        !process.env.PREVIEW_SECRET ||
        req.headers.get("x-preview-secret") !== process.env.PREVIEW_SECRET
      ) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const url = new URL(req.url ?? "", "http://localhost");
      const slug = url.searchParams.get("slug");
      const locale = url.searchParams.get("locale") ?? "de";
      if (!slug)
        return Response.json({ error: "Missing slug" }, { status: 400 });

      const result = await req.payload.find({
        collection,
        where: { slug: { equals: slug } },
        locale: locale as "de" | "en" | "ar" | "fa" | "uk" | "ku",
        draft: true,
        overrideAccess: true,
        depth: 2,
        limit: 1,
      });

      return Response.json(result);
    },
  };
}
