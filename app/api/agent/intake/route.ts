import { NextResponse } from "next/server";
import { ingestAgentDiscovery } from "../../../../lib/repository";

function validSlug(value: string) { return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value); }

export async function POST(request: Request) {
  const configuredToken = process.env.AGENT_INGEST_TOKEN;
  if (!configuredToken) return NextResponse.json({ error: "Agent intake is disabled." }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${configuredToken}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as Record<string, unknown>;
  if (typeof body.name !== "string" || typeof body.slug !== "string" || !validSlug(body.slug)) {
    return NextResponse.json({ error: "A valid name and kebab-case slug are required." }, { status: 400 });
  }
  const result = await ingestAgentDiscovery({
    name: body.name.slice(0, 120), slug: body.slug.slice(0, 80),
    industry: typeof body.industry === "string" ? body.industry.slice(0, 80) : undefined,
    city: typeof body.city === "string" ? body.city.slice(0, 80) : undefined,
    website: typeof body.website === "string" ? body.website.slice(0, 300) : null,
    notes: typeof body.notes === "string" ? body.notes.slice(0, 2000) : undefined,
  });
  return NextResponse.json(result, { status: 202 });
}
