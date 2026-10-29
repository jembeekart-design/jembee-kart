import { NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/firebase/admin";
import { v2 as cloudinary } from "cloudinary";
import { deleteDriveFile } from "@/services/googleDriveService";
import { readBoundedJson } from "@/lib/server/readBoundedJson";

// Configure Cloudinary
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
    // 1. Verify Admin Role
    const decodedToken = await adminAuth.verifyIdToken(token);
    
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
        console.error("Drive deletion failed; video was not deleted:", driveError);
        return NextResponse.json(
          { success: false, message: "Drive asset removal failed. Video was not deleted." },
          { status: 500 }
        );
      }
    } else if (storedPublicId) {
      try {
        await cloudinary.uploader.destroy(storedPublicId, { resource_type: "video" });
      } catch (cloudinaryError) {
        console.error("Cloudinary deletion failed; video was not deleted:", cloudinaryError);
        return NextResponse.json(
          { success: false, message: "Cloudinary asset removal failed. Video was not deleted." },
          { status: 500 }
        );
      }
    }

    // 4. Delete related Firestore records in bounded batches (Firestore limit is 500 writes/batch).
    // Use smaller batches to leave headroom if additional cleanup writes are added later.
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
    await deleteRelated("videoReports", "videoId", videoId);

    // Delete the main record only after related-record cleanup succeeds.
    await videoRef.delete();

    return NextResponse.json({ success: true, message: "Video deleted successfully." });
  } catch (error) {
    console.error("Delete Video API Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
