import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { getAdminForApi } from "../../../../../../lib/admin-auth";
import { createMediaAsset, removeMediaAsset } from "../../../../../../lib/repository";

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
  if (!env.MEDIA) return NextResponse.json({ error: "Image storage is not available yet. Please try again shortly." }, { status: 503 });
  try {
    await env.MEDIA.put(objectKey, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" },
      customMetadata: { businessId, uploadedBy: admin.email },
    });
  } catch {
    return NextResponse.json({ error: "The image could not be uploaded. Please try again." }, { status: 502 });
  }
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

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await getAdminForApi();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const assetId = new URL(request.url).searchParams.get("assetId");
  if (!assetId) return NextResponse.json({ error: "Image id is required." }, { status: 400 });
  try {
    const asset = await removeMediaAsset(assetId, (await context.params).id);
    if (!asset) return NextResponse.json({ error: "Image not found." }, { status: 404 });
    if (env.MEDIA) await env.MEDIA.delete(asset.objectKey);
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "Could not remove the image." }, { status: 503 });
  }
}
