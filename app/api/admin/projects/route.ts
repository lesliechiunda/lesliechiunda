import { NextResponse } from "next/server";
import { getAdminForApi } from "../../../../lib/admin-auth";
import { createPortfolioProject } from "../../../../lib/repository";

export async function POST(request: Request) {
  const admin = await getAdminForApi();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as Record<string, unknown>;
  if (typeof body.title !== "string" || !body.title.trim() || typeof body.href !== "string" || !body.href.trim()) {
    return NextResponse.json({ error: "Project title and URL are required." }, { status: 400 });
  }
  try {
    const project = await createPortfolioProject({
      title: body.title.trim().slice(0, 120),
      category: typeof body.category === "string" ? body.category.slice(0, 100) : "Website",
      summary: typeof body.summary === "string" ? body.summary.slice(0, 2000) : "",
      href: body.href.trim().slice(0, 500),
      image: typeof body.image === "string" && body.image.trim() ? body.image.trim().slice(0, 500) : null,
      tone: typeof body.tone === "string" && ["lime", "clay", "blue", "ink"].includes(body.tone) ? body.tone : "lime",
      published: body.published !== false,
      featured: body.featured === true,
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
    });
    return NextResponse.json({ project }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create the project." }, { status: 503 });
  }
}
