import { NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/firebase/admin";
import { v2 as cloudinary } from "cloudinary";

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
    const { videoId, token } = await req.json();

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

    // 4. Delete Cloudinary Asset
    const publicId = videoData?.publicId;
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
      } catch (cloudinaryError) {
        console.error("Cloudinary Deletion Failed:", cloudinaryError);
        return NextResponse.json(
          { success: false, message: "Cloudinary asset removal failed." },
          { status: 500 }
        );
      }
    }

    // 5. Perform Cascading Deletion in Firestore (Atomic)
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
    // Preserving videoReports (audit/moderation record)

    // Delete Main Video Document
    batch.delete(videoRef);

    // Commit Firestore Changes
    await batch.commit();

    return NextResponse.json({ success: true, message: "Video deleted successfully." });
  } catch (error) {
    console.error("Delete Video API Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
