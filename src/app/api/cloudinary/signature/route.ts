import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 500 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const header = req.headers.get("authorization");
    if (!header?.startsWith("Bearer ")) return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    const decoded = await getAdminAuth().verifyIdToken(header.slice(7).trim(), true);
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > 2048) return NextResponse.json({ success: false, message: "Request body too large" }, { status: 413 });
    const body = JSON.parse(raw);
    const resourceType = body?.resourceType;
    const mimeType = typeof body?.mimeType === "string" ? body.mimeType.toLowerCase() : "";
    const fileSize = Number(body?.fileSize);
    if (resourceType !== "image" && resourceType !== "video") return NextResponse.json({ success: false, message: "Unsupported resource type" }, { status: 400 });
    const allowedMime = resourceType === "image" ? ["image/jpeg", "image/png", "image/webp", "image/gif"] : ["video/mp4", "video/webm", "video/quicktime"];
    const maxSize = resourceType === "image" ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    if (!allowedMime.includes(mimeType) || !Number.isSafeInteger(fileSize) || fileSize < 1 || fileSize > maxSize) return NextResponse.json({ success: false, message: "File type or size is not allowed" }, { status: 400 });

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = process.env.CLOUDINARY_SIGNED_UPLOAD_PRESET;
    if (!cloudName || !apiKey || !apiSecret || !uploadPreset) return NextResponse.json({ success: false, message: "Signed upload is not configured" }, { status: 503 });
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
    const rateRef = getAdminDb().collection("cloudinaryUploadLimits").doc(decoded.uid);
    const hourWindow = Math.floor(Date.now() / 3600000);
    const allowed = await getAdminDb().runTransaction(async (tx) => {
      const snap = await tx.get(rateRef);
      const data = snap.data() || {};
      const count = data.hourWindow === hourWindow ? Number(data.count || 0) : 0;
      const bytes = data.hourWindow === hourWindow ? Number(data.bytes || 0) : 0;
      if (count >= 30 || bytes + fileSize > 2 * 1024 * 1024 * 1024) return false;
      tx.set(rateRef, { hourWindow, count: count + 1, bytes: bytes + fileSize, updatedAt: new Date() }, { merge: true });
      return true;
    });
    if (!allowed) return NextResponse.json({ success: false, message: "Upload rate limit reached. Please try again later." }, { status: 429 });

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `jembeekart/${decoded.uid}`;
    const publicId = `${resourceType}_${randomUUID()}`;
    const paramsToSign = { folder, overwrite: "false", public_id: publicId, timestamp, upload_preset: uploadPreset };
    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
    return NextResponse.json({ success: true, cloudName, apiKey, timestamp, folder, publicId, uploadPreset, signature, resourceType }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Cloudinary signature request failed:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ success: false, message: "Unable to authorize upload" }, { status: 401 });
  }
}
