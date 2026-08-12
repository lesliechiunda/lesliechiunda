import { NextResponse } from "next/server";
import { getAdminForApi } from "../../../../../lib/admin-auth";
import { deletePortfolioProject, updatePortfolioProject } from "../../../../../lib/repository";

const allowed = new Set(["title", "category", "summary", "href", "image", "tone", "published", "featured", "sortOrder"]);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await getAdminForApi();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as Record<string, unknown>;
  const values: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(body)) {
    if (!allowed.has(key)) continue;
    if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean" && value !== null) {
      return NextResponse.json({ error: `Invalid ${key}.` }, { status: 400 });
    }
    values[key] = typeof value === "string" ? value.slice(0, key === "summary" ? 2000 : 500) : value;
  }
  if (!Object.keys(values).length) return NextResponse.json({ error: "No supported fields supplied." }, { status: 400 });
  try {
    const project = await updatePortfolioProject((await context.params).id, values);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ project });
  } catch {
    return NextResponse.json({ error: "Could not update the project." }, { status: 503 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await getAdminForApi();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const project = await deletePortfolioProject((await context.params).id);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "Could not delete the project." }, { status: 503 });
  }
}
