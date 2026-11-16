import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TOKEN_LENGTH = 10_000;

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization") || "";
    if (!authorization.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = authorization.slice(7).trim();
    if (!token || token.length > MAX_TOKEN_LENGTH) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = await getAdminAuth().verifyIdToken(token, true);
    const body = await req.json().catch(() => null);
    const videoId = typeof body?.videoId === "string" ? body.videoId.trim() : "";
    const saved = body?.saved;

    if (!videoId || videoId.length > 200 || /[\/\\]/.test(videoId) || typeof saved !== "boolean") {
      return NextResponse.json({ success: false, message: "Invalid save request" }, { status: 400 });
    }

    const db = getAdminDb();
    const videoRef = db.collection("watchEarnVideos").doc(videoId);
    const saveRef = db.collection("savedWatchVideos").doc(`${videoId}_${decoded.uid}`);

    const result = await db.runTransaction(async (transaction) => {
      const videoSnap = await transaction.get(videoRef);
      if (!videoSnap.exists) return { error: "VIDEO_UNAVAILABLE" as const };

      const video = videoSnap.data();
      // Only public, approved, active and safe videos may be saved. Paid/private
      // content is deliberately excluded; authorization is never inferred here.
      if (
        video?.status !== "approved" ||
        video?.active !== true ||
        video?.moderation !== "safe" ||
        video?.videoAccess !== "free"
      ) {
        return { error: "VIDEO_UNAVAILABLE" as const };
      }

      const saveSnap = await transaction.get(saveRef);
      if (saved) {
        if (!saveSnap.exists) {
          transaction.create(saveRef, {
            videoId,
            userId: decoded.uid,
            createdAt: Date.now(),
          });
        }
      } else if (saveSnap.exists) {
        transaction.delete(saveRef);
      }

      return { saved };
    });

    if ("error" in result) {
      return NextResponse.json({ success: false, message: "Video is unavailable" }, { status: 404 });
    }

    return NextResponse.json({ success: true, saved: result.saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const unauthorized = message.includes("Firebase ID token") || message === "UNAUTHORIZED";
    console.error("Saved video update failed:", error);
    return NextResponse.json(
      { success: false, message: unauthorized ? "Unauthorized" : "Saved videos are temporarily unavailable" },
      { status: unauthorized ? 401 : 500 }
    );
  }
}
