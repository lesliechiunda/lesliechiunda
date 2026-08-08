import { NextResponse } from "next/server";
import { getAdminForApi } from "../../../../lib/admin-auth";
import { createBusiness } from "../../../../lib/repository";

function cleanSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  const admin = await getAdminForApi();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as Record<string, unknown>;
  if (typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "Business name is required." }, { status: 400 });
  }
  const slug = cleanSlug(typeof body.slug === "string" && body.slug ? body.slug : body.name);
  if (!slug) return NextResponse.json({ error: "A valid slug is required." }, { status: 400 });
  try {
    const business = await createBusiness({
      name: body.name.trim().slice(0, 120),
      slug: slug.slice(0, 80),
      industry: typeof body.industry === "string" ? body.industry.slice(0, 80) : "Other",
      city: typeof body.city === "string" ? body.city.slice(0, 80) : "",
      headline: typeof body.headline === "string" ? body.headline.slice(0, 180) : "",
      summary: typeof body.summary === "string" ? body.summary.slice(0, 1200) : "",
      source: "manual",
    });
    return NextResponse.json({ business }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return NextResponse.json({ error: message.includes("UNIQUE") ? "That slug is already in use." : "Could not create the listing." }, { status: 409 });
  }
}
