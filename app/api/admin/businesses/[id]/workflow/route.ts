import { NextResponse } from "next/server";
import { getAdminForApi } from "../../../../../../lib/admin-auth";
import { createAdminWorkflowJob } from "../../../../../../lib/repository";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await getAdminForApi();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as { jobType?: string };
  if (body.jobType !== "preview_build_request" && body.jobType !== "outreach_draft") {
    return NextResponse.json({ error: "Choose a supported workflow action." }, { status: 400 });
  }
  try {
    const job = await createAdminWorkflowJob({
      businessId: (await context.params).id,
      jobType: body.jobType,
      actorEmail: admin.email,
    });
    if (!job) return NextResponse.json({ error: "Business not found." }, { status: 404 });
    return NextResponse.json({ job }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not add that item to the queue." }, { status: 503 });
  }
}
