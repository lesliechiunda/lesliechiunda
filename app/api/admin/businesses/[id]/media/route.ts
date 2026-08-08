import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { getAdminForApi } from "../../../../../../lib/admin-auth";
import { createMediaAsset } from "../../../../../../lib/repository";

const allowedTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await getAdminForApi();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  const altText = typeof form.get("altText") === "string" ? String(form.get("altText")).slice(0, 240) : "";
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  const extension = allowedTypes[file.type];
  if (!extension) return NextResponse.json({ error: "Use a JPG, PNG, WebP or AVIF image." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Images must be 8 MB or smaller." }, { status: 400 });

  const businessId = (await context.params).id;
  const objectKey = `businesses/${businessId}/${crypto.randomUUID()}.${extension}`;
  await env.MEDIA.put(objectKey, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" },
    customMetadata: { businessId, uploadedBy: admin.email },
  });
  try {
    const asset = await createMediaAsset({
      businessId, objectKey, filename: file.name.slice(0, 180), contentType: file.type,
      sizeBytes: file.size, altText, createdBy: admin.email,
    });
    return NextResponse.json({ asset, imageUrl: `/api/media/${asset.id}` }, { status: 201 });
  } catch {
    await env.MEDIA.delete(objectKey);
    return NextResponse.json({ error: "Could not attach the image to this listing." }, { status: 500 });
  }
}
