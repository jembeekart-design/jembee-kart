import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { uploadToCloudinary } from "@/lib/cloudinary";

const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
]);

export async function POST(req: Request) {
  const authorization = req.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let uid: string;
  try {
    const decoded = await getAdminAuth().verifyIdToken(authorization.slice(7).trim());
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "Video file is required" }, { status: 400 });
    }
    if (!ALLOWED_VIDEO_TYPES.has(file.type.toLowerCase())) {
      return NextResponse.json({ success: false, error: "Unsupported video type" }, { status: 415 });
    }
    if (file.size <= 0 || file.size > MAX_VIDEO_BYTES) {
      return NextResponse.json({ success: false, error: "Video must be between 1 byte and 100MB" }, { status: 413 });
    }

    // The authenticated UID is authoritative; never trust a userId sent in the form.
    const cloudinaryResponse = await uploadToCloudinary(file, "video");
    if (!cloudinaryResponse?.secure_url || typeof cloudinaryResponse.secure_url !== "string") {
      return NextResponse.json({ success: false, error: "Video upload failed" }, { status: 502 });
    }

    const adminDb = getAdminDb();
    const videoRef = await adminDb.collection("watchEarnVideos").add({
      userId: uid,
      creatorId: uid,
      video: cloudinaryResponse.secure_url,
      status: "pending",
      moderation: "pending",
      coins: 0,
      pendingCoins: 0,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, videoId: videoRef.id, status: "pending" }, { status: 201 });
  } catch (error) {
    console.error("MLM video upload failed:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ success: false, error: "Video upload failed" }, { status: 500 });
  }
}
