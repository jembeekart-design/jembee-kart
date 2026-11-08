import { NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/firebase/admin";
import { v2 as cloudinary } from "cloudinary";
import { deleteDriveFile } from "@/services/googleDriveService";
import { cleanupVideoRecords } from "@/services/videoDeletionService";

// Configure Cloudinary securely
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

    // 1. Verify User Authentication and token revocation state.
    const decodedToken = await adminAuth.verifyIdToken(authHeader.slice(7).trim(), true);
    const authenticatedUid = decodedToken.uid;

    // 2. Validate Video Exists and fetch data
    const videoRef = adminDb.collection("watchEarnVideos").doc(videoId);
    const videoDoc = await videoRef.get();
    
    if (!videoDoc.exists) {
        return NextResponse.json({ success: false, message: "Video not found" }, { status: 404 });
    }

    const videoData = videoDoc.data();

    // 3. Verify Ownership (Strictly Creator)
    const creatorId = videoData?.creatorId;
    const userId = videoData?.userId;

    if (creatorId !== authenticatedUid && userId !== authenticatedUid) {
      return NextResponse.json({ success: false, message: "Unauthorized: You do not own this video" }, { status: 403 });
    }
    if (videoData?.deletionState !== "deleting") {
      await videoRef.update({ active: false, status: "deleting", deletionState: "deleting", deletionStartedAt: new Date(), deletionRequestedBy: authenticatedUid });
    }

    // 4. Delete the stored asset from its actual storage provider
    const driveFileId =
      typeof videoData?.driveFileId === "string"
        ? videoData.driveFileId.trim()
        : "";
    const publicId =
      typeof videoData?.publicId === "string"
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
          { success: false, message: "Drive asset removal failed." },
            { status: 500 }
          );
        }
      }
    } else if (publicId) {
      try {
        const result = await cloudinary.uploader.destroy(
          publicId,
          { resource_type: "video" }
        );

        if (result.result !== "ok" && result.result !== "not found") {
          console.error("Unexpected Cloudinary deletion result:", result.result);
          return NextResponse.json(
            { success: false, message: "Cloudinary asset removal failed." },
            { status: 500 }
          );
        }
      } catch (cloudinaryError) {
        console.error("Cloudinary Deletion Failed:", cloudinaryError);
        return NextResponse.json(
          { success: false, message: "Cloudinary asset removal failed." },
          { status: 500 }
        );
      }
    }

    // 5. Shared chunked cleanup preserves moderation evidence consistently for admin and creator paths.
    await cleanupVideoRecords(adminDb, videoId, videoRef);

    return NextResponse.json({ success: true, message: "Video deleted successfully." });
  } catch (error) {
    console.error("Delete Video API Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
