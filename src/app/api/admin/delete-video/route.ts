import { NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/firebase/admin";
import { v2 as cloudinary } from "cloudinary";
import { deleteDriveFile } from "@/services/googleDriveService";

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
    const { videoId, token } = await req.json();
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

    // 4. Perform Cascading Deletion in Firestore (only if Cloudinary succeeded)
    const batch = adminDb.batch();

    // Helper to delete associated records
    const deleteRelated = async (collection: string, field: string, value: string) => {
      const snapshot = await adminDb.collection(collection).where(field, "==", value).get();
      snapshot.forEach((doc) => batch.delete(doc.ref));
    };

    await deleteRelated("watchVideoLikes", "videoId", videoId);
    await deleteRelated("watchVideoShares", "videoId", videoId);
    await deleteRelated("savedWatchVideos", "videoId", videoId);
    await deleteRelated("videoComments", "videoId", videoId);
    await deleteRelated("videoReports", "videoId", videoId);

    // Delete Main Video Document
    batch.delete(videoRef);

    // 5. Commit Firestore Changes
    await batch.commit();

    return NextResponse.json({ success: true, message: "Video deleted successfully." });
  } catch (error) {
    console.error("Delete Video API Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
