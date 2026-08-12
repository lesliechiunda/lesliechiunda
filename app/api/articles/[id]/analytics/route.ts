import { NextResponse } from "next/server";
import { getBlogArticleById, recordArticleAnalytics } from "../../../../../lib/repository";

const events = new Set(["view", "read", "share"]);

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const event = ((await request.json()) as { event?: string }).event;
  if (!event || !events.has(event)) return NextResponse.json({ error: "Invalid analytics event." }, { status: 400 });

  try {
    const article = await getBlogArticleById((await context.params).id);
    if (!article || article.status !== "published" || !article.publicationApprovedAt) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await recordArticleAnalytics(article.id, event as "view" | "read" | "share");
    return NextResponse.json({ recorded: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not record analytics." }, { status: 503 });
  }
}
