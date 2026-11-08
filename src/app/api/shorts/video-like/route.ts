import { NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/firebase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { videoId, action, token } = body ?? {};

    if (
      typeof videoId !== "string" ||
      !videoId.trim() ||
      videoId.length > 500 ||
      !["like", "unlike"].includes(action) ||
      typeof token !== "string" ||
      !token
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid request" },
        { status: 400 }
      );
    }

    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;
    const adminDb = getAdminDb();

    const videoRef = adminDb.collection("watchEarnVideos").doc(videoId);
    const likeRef = adminDb
      .collection("watchVideoLikes")
      .doc(`${videoId}_${uid}`);

    const result = await adminDb.runTransaction(async (transaction) => {
      const videoSnap = await transaction.get(videoRef);
      const likeSnap = await transaction.get(likeRef);

      if (!videoSnap.exists) {
        return { success: false, message: "Video not found", status: 404 };
      }

      const videoData = videoSnap.data();

      if (
        videoData?.active !== true ||
        videoData?.status !== "approved" ||
        videoData?.moderation !== "safe"
      ) {
        return {
          success: false,
          message: "Video is not available for interaction",
          status: 403,
        };
      }

      const currentLikes = Number(videoData?.likes ?? 0);
      const safeLikes =
        Number.isFinite(currentLikes) && currentLikes >= 0
          ? Math.floor(currentLikes)
          : 0;

      if (action === "like") {
        if (likeSnap.exists) {
          return {
            success: false,
            message: "Already liked",
            status: 409,
          };
        }

        transaction.set(likeRef, {
          videoId,
          userId: uid,
          createdAt: Date.now(),
        });

        transaction.update(videoRef, { likes: safeLikes + 1 });

        return { success: true, status: 200 };
      }

      if (!likeSnap.exists) {
        return {
          success: false,
          message: "Not liked",
          status: 409,
        };
      }

      transaction.delete(likeRef);
      transaction.update(videoRef, {
        likes: Math.max(0, safeLikes - 1),
      });

      return { success: true, status: 200 };
    });

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("Shorts like API error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update like" },
      { status: 500 }
    );
  }
}
