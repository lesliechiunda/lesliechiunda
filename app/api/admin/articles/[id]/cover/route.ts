import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { getAdminForApi } from "../../../../../../lib/admin-auth";
import { getBlogArticleById, updateBlogArticle } from "../../../../../../lib/repository";

const allowedTypes: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await getAdminForApi();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = (await context.params).id;
  const article = await getBlogArticleById(id);
  if (!article) return NextResponse.json({ error: "Article not found." }, { status: 404 });
  const form = await request.formData();
  const file = form.get("file");
  const altText = typeof form.get("altText") === "string" ? String(form.get("altText")).slice(0, 240) : article.coverAlt;
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  const extension = allowedTypes[file.type];
  if (!extension) return NextResponse.json({ error: "Use a JPG, PNG, WebP or AVIF image." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Images must be 8 MB or smaller." }, { status: 400 });
  if (!env.MEDIA) return NextResponse.json({ error: "Image storage is not available yet." }, { status: 503 });
  const objectKey = `articles/${id}/${crypto.randomUUID()}.${extension}`;
  try {
    await env.MEDIA.put(objectKey, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" },
      customMetadata: { articleId: id, uploadedBy: admin.email },
    });
    const updated = await updateBlogArticle(id, { coverImage: `/api/article-media/${id}`, coverAlt: altText, coverObjectKey: objectKey, coverContentType: file.type });
    if (!updated) throw new Error("Article not found");
    if (article.coverObjectKey) await env.MEDIA.delete(article.coverObjectKey);
    return NextResponse.json({ article: updated, imageUrl: `${updated.coverImage}?v=${encodeURIComponent(updated.updatedAt)}` });
  } catch {
    await env.MEDIA.delete(objectKey);
    return NextResponse.json({ error: "Could not attach the cover image." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await getAdminForApi();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = (await context.params).id;
  try {
    const article = await getBlogArticleById(id);
    if (!article) return NextResponse.json({ error: "Article not found." }, { status: 404 });
    await updateBlogArticle(id, { coverImage: null, coverObjectKey: null, coverContentType: null });
    if (article.coverObjectKey && env.MEDIA) await env.MEDIA.delete(article.coverObjectKey);
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "Could not remove the cover image." }, { status: 503 });
  }
}
