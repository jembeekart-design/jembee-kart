import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { uploadToCloudinary } from "@/lib/cloudinary";

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const decoded = await getAdminAuth().verifyIdToken(authHeader.slice(7).trim());
    const formData = await req.formData();
    const fileValue = formData.get("file");
    if (!(fileValue instanceof File)) {
      return NextResponse.json({ success: false, error: "Video file is required" }, { status: 400 });
    }
    if (fileValue.size <= 0 || fileValue.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ success: false, error: "Video file size is invalid" }, { status: 413 });
    }
    if (!ALLOWED_TYPES.has(fileValue.type)) {
      return NextResponse.json({ success: false, error: "Unsupported video type" }, { status: 415 });
    }

    // Bind ownership to the verified Firebase identity; ignore client-supplied userId.
    const userId = decoded.uid;
    const cloudinaryResponse = await uploadToCloudinary(fileValue, "video");
    const adminDb = getAdminDb();
    await adminDb.collection("watchEarnVideos").add({
      userId,
      video: cloudinaryResponse.secure_url,
      status: "pending",
      coins: 0,
      pendingCoins: 0,
      createdAt: Date.now(),
    });
    return NextResponse.json({ success: true, videoUrl: cloudinaryResponse.secure_url }, { status: 201 });
  } catch (error) {
    console.error("MLM merge upload failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ success: false, error: "Unable to upload video" }, { status: 500 });
  }
}
