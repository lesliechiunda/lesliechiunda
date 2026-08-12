import { NextResponse } from "next/server";
import { getAdminForApi } from "../../../../lib/admin-auth";
import { createBlogArticle } from "../../../../lib/repository";

function cleanSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 140);
}

export async function POST(request: Request) {
  const admin = await getAdminForApi();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as Record<string, unknown>;
  if (typeof body.title !== "string" || !body.title.trim()) return NextResponse.json({ error: "Article title is required." }, { status: 400 });
  const slug = cleanSlug(typeof body.slug === "string" && body.slug ? body.slug : body.title);
  if (!slug) return NextResponse.json({ error: "A valid article URL is required." }, { status: 400 });
  try {
    const article = await createBlogArticle({
      title: body.title.trim().slice(0, 180), slug,
      excerpt: typeof body.excerpt === "string" ? body.excerpt.slice(0, 800) : "",
      body: typeof body.body === "string" ? body.body.slice(0, 100000) : "",
      category: typeof body.category === "string" ? body.category.slice(0, 100) : "Studio notes",
      coverImage: typeof body.coverImage === "string" && body.coverImage.trim() ? body.coverImage.trim().slice(0, 500) : null,
      coverAlt: typeof body.coverAlt === "string" ? body.coverAlt.slice(0, 240) : "",
      status: body.status === "published" ? "published" : "draft",
      seoTitle: typeof body.seoTitle === "string" && body.seoTitle.trim() ? body.seoTitle.slice(0, 180) : null,
      seoDescription: typeof body.seoDescription === "string" && body.seoDescription.trim() ? body.seoDescription.slice(0, 320) : null,
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
    });
    return NextResponse.json({ article }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create the article. Check that its URL is unique." }, { status: 503 });
  }
}
