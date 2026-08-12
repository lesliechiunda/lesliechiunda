import { env } from "cloudflare:workers";
import { getBlogArticleById } from "../../../../lib/repository";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const article = await getBlogArticleById((await context.params).id);
    if (!article?.coverObjectKey || !env.MEDIA) return new Response("Not found", { status: 404 });
    const object = await env.MEDIA.get(article.coverObjectKey);
    if (!object) return new Response("Not found", { status: 404 });
    const headers = new Headers();
    object.writeHttpMetadata(headers); headers.set("etag", object.httpEtag); headers.set("content-disposition", "inline"); headers.set("x-content-type-options", "nosniff");
    return new Response(object.body, { headers });
  } catch { return new Response("Not found", { status: 404 }); }
}
