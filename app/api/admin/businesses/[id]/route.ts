import { NextResponse } from "next/server";
import { getAdminForApi } from "../../../../../lib/admin-auth";
import { updateBusiness } from "../../../../../lib/repository";

const allowed = new Set([
  "name", "slug", "industry", "city", "website", "websiteStatus", "previewStatus", "previewUrl",
  "outreachStatus", "approvalStatus", "priority", "contactName", "contactEmail", "contactPhone",
  "eyebrow", "headline", "summary", "services", "notes",
]);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await getAdminForApi();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as Record<string, unknown>;
  const entries = Object.entries(body).filter(([key]) => allowed.has(key));
  if (entries.length === 0) return NextResponse.json({ error: "No supported fields supplied." }, { status: 400 });
  const values: Record<string, string | number | null> = {};
  for (const [field, value] of entries) {
    if (value !== null && typeof value !== "string" && typeof value !== "number") {
      return NextResponse.json({ error: `Invalid ${field}.` }, { status: 400 });
    }
    values[field] = typeof value === "string" ? value.slice(0, field === "summary" || field === "notes" ? 3000 : 300) : value;
  }
  if (typeof values.slug === "string" && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) {
    return NextResponse.json({ error: "Slug must use lowercase letters, numbers and hyphens." }, { status: 400 });
  }
  try {
    const business = await updateBusiness((await context.params).id, values, admin.email);
    if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ business });
  } catch {
    return NextResponse.json({ error: "The data store is not ready." }, { status: 503 });
  }
}
