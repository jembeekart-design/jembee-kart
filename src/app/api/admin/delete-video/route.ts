import { NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/firebase/admin";
import { v2 as cloudinary } from "cloudinary";
import { deleteDriveFile } from "@/services/googleDriveService";
import { cleanupVideoRecords } from "@/services/videoDeletionService";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const adminDb = getAdminDb();
    const adminAuth = getAdminAuth();
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const { videoId } = await req.json();
    if (typeof videoId !== "string" || !videoId.trim() || videoId.length > 200 || videoId.includes("/")) return NextResponse.json({ success: false, message: "Invalid video ID" }, { status: 400 });
    // 1. Verify Admin Role and token revocation state.
    const decodedToken = await adminAuth.verifyIdToken(authHeader.slice(7).trim(), true);
    
    const userSnapshot = await adminDb
      .collection("users")
      .where("uid", "==", decodedToken.uid)
      .get();
      
    const userDoc = userSnapshot.docs[0];
    
    if (!userDoc || (userDoc.data()?.role !== "admin" && userDoc.data()?.role !== "super_admin")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    // 2. Validate Video Exists and fetch data (publicId is passed, but we should confirm video exists)
    const videoRef = adminDb.collection("watchEarnVideos").doc(videoId);
    const videoDoc = await videoRef.get();
    if (!videoDoc.exists) {
        return NextResponse.json({ success: false, message: "Video not found" }, { status: 404 });
    }

    // 3. Delete the stored asset from its actual storage provider.
    const videoData = videoDoc.data() || {};
    if (videoData.deletionState !== "deleting") {
      await videoRef.update({ active: false, status: "deleting", deletionState: "deleting", deletionStartedAt: new Date(), deletionRequestedBy: decodedToken.uid });
    }
    const driveFileId =
      typeof videoData.driveFileId === "string"
        ? videoData.driveFileId.trim()
        : "";
    const storedPublicId =
      typeof videoData.publicId === "string"
        ? videoData.publicId.trim()
        : "";

    if (driveFileId) {
      try {
        await deleteDriveFile(driveFileId);
      } catch (driveError) {
        const status = (driveError as any)?.code ?? (driveError as any)?.response?.status;
        if (Number(status) !== 404) {
          console.error("Drive deletion failed; video remains hidden for retry:", driveError);
          return NextResponse.json(
          { success: false, message: "Drive asset removal failed. Video was not deleted." },
            { status: 500 }
          );
        }
      }
    } else if (storedPublicId) {
      try {
        const result = await cloudinary.uploader.destroy(storedPublicId, { resource_type: "video" });
        if (result.result !== "ok" && result.result !== "not found") {
          return NextResponse.json({ success: false, message: "Cloudinary asset removal failed; video is safely hidden and can be retried." }, { status: 502 });
        }
      } catch (cloudinaryError) {
        console.error("Cloudinary deletion failed; video was not deleted:", cloudinaryError);
        return NextResponse.json(
          { success: false, message: "Cloudinary asset removal failed. Video was not deleted." },
          { status: 500 }
        );
      }
    }

    // 4. Chunked, retryable cleanup. The video is already hidden with deletionState=deleting.
    await cleanupVideoRecords(adminDb, videoId, videoRef);

    return NextResponse.json({ success: true, message: "Video deleted successfully." });
  } catch (error) {
    console.error("Delete Video API Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
