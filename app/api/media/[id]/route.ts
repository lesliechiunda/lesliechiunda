import { env } from "cloudflare:workers";
import { getMediaAsset } from "../../../../lib/repository";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const asset = await getMediaAsset((await context.params).id);
    if (!asset) return new Response("Not found", { status: 404 });
    const object = await env.MEDIA.get(asset.objectKey);
    if (!object) return new Response("Not found", { status: 404 });
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("content-disposition", "inline");
    headers.set("x-content-type-options", "nosniff");
    return new Response(object.body, { headers });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
