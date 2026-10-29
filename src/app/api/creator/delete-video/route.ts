import { NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/firebase/admin";
import { v2 as cloudinary } from "cloudinary";
import { deleteDriveFile } from "@/services/googleDriveService";
import { readBoundedJson } from "@/lib/server/readBoundedJson";

// Configure Cloudinary securely
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const parsed = await readBoundedJson(req, 8 * 1024);
    if (!parsed.ok) {
      return NextResponse.json({ success: false, message: parsed.message }, { status: parsed.status });
    }
    if (!parsed.value || typeof parsed.value !== "object" || Array.isArray(parsed.value)) {
      return NextResponse.json({ success: false, message: "Request body must be a JSON object" }, { status: 400 });
    }
    const { videoId, token } = parsed.value as { videoId?: unknown; token?: unknown };
    if (typeof videoId !== "string" || !videoId.trim() || videoId.length > 128 || videoId.includes("/") || typeof token !== "string" || !token.trim()) {
      return NextResponse.json({ success: false, message: "Valid videoId and token are required" }, { status: 400 });
    }
    const adminDb = getAdminDb();
    const adminAuth = getAdminAuth();

    // 1. Verify User Authentication
    const decodedToken = await adminAuth.verifyIdToken(token);
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
        console.error("Drive deletion failed:", driveError);
        return NextResponse.json(
          { success: false, message: "Drive asset removal failed." },
          { status: 500 }
        );
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

    // 5. Delete related Firestore records in bounded batches (Firestore limit is 500 writes/batch).
    // Keep moderation reports as audit evidence; delete the other related records in chunks.
    const deleteRelated = async (collection: string, field: string, value: string) => {
      const snapshot = await adminDb.collection(collection).where(field, "==", value).get();
      for (let offset = 0; offset < snapshot.docs.length; offset += 400) {
        const batch = adminDb.batch();
        snapshot.docs.slice(offset, offset + 400).forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
      }
    };

    await deleteRelated("watchVideoLikes", "videoId", videoId);
    await deleteRelated("watchVideoShares", "videoId", videoId);
    await deleteRelated("savedWatchVideos", "videoId", videoId);
    await deleteRelated("videoComments", "videoId", videoId);

    // Delete the main record only after related-record cleanup succeeds.
    await videoRef.delete();

    return NextResponse.json({ success: true, message: "Video deleted successfully." });
  } catch (error) {
    console.error("Delete Video API Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
