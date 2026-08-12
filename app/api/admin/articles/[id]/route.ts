import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { getAdminForApi } from "../../../../../lib/admin-auth";
import { deleteBlogArticle, getBlogArticleById, updateBlogArticle } from "../../../../../lib/repository";

const allowed = new Set(["title", "slug", "excerpt", "body", "category", "coverImage", "coverAlt", "status", "seoTitle", "seoDescription", "sortOrder", "publishedAt"]);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await getAdminForApi();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = (await context.params).id;
  const body = (await request.json()) as Record<string, unknown>;
  const values: Record<string, string | number | null> = {};
  for (const [key, value] of Object.entries(body)) {
    if (!allowed.has(key)) continue;
    if (typeof value !== "string" && typeof value !== "number" && value !== null) return NextResponse.json({ error: `Invalid ${key}.` }, { status: 400 });
    if (key === "status" && value !== "draft" && value !== "published") return NextResponse.json({ error: "Status must be draft or published." }, { status: 400 });
    if (key === "publishedAt" && typeof value === "string" && Number.isNaN(Date.parse(value))) return NextResponse.json({ error: "Publication date is invalid." }, { status: 400 });
    if (key === "slug" && typeof value === "string") values.slug = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 140);
    else if (typeof value === "string") values[key] = value.slice(0, key === "body" ? 100000 : key === "excerpt" ? 800 : 500);
    else values[key] = value;
  }
  if (!Object.keys(values).length) return NextResponse.json({ error: "No supported fields supplied." }, { status: 400 });
  try {
    if (values.status) {
      const current = await getBlogArticleById(id);
      values.publishedAt = values.status === "published" ? values.publishedAt ?? current?.publishedAt ?? new Date().toISOString() : values.publishedAt ?? null;
      values.publicationApprovedAt = values.status === "published" ? new Date().toISOString() : null;
    }
    const article = await updateBlogArticle(id, values);
    if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ article });
  } catch {
    return NextResponse.json({ error: "Could not update the article. Check that its URL is unique." }, { status: 503 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await getAdminForApi();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const article = await deleteBlogArticle((await context.params).id);
    if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (article.coverObjectKey && env.MEDIA) await env.MEDIA.delete(article.coverObjectKey);
    return NextResponse.json({ deleted: true, objectKey: article.coverObjectKey });
  } catch {
    return NextResponse.json({ error: "Could not delete the article." }, { status: 503 });
  }
}
