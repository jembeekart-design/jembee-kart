import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const authorization = req.headers.get("authorization");
    if (!authorization?.startsWith("Bearer ")) return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    const decoded = await getAdminAuth().verifyIdToken(authorization.slice(7).trim());
    const body = await req.json();
    const videoId = typeof body?.videoId === "string" ? body.videoId.trim() : "";
    if (!videoId || videoId.length > 180 || videoId.includes("/")) return NextResponse.json({ success: false, message: "Invalid video ID" }, { status: 400 });

    const db = getAdminDb();
    const videoRef = db.collection("watchEarnVideos").doc(videoId);
    const shareRef = db.collection("watchVideoShares").doc(`${videoId}_${decoded.uid}`);
    const result = await db.runTransaction(async (tx) => {
      const [videoSnap, shareSnap] = await Promise.all([tx.get(videoRef), tx.get(shareRef)]);
      if (!videoSnap.exists) return { success: false, message: "Video not found", status: 404 };
      const video = videoSnap.data() ?? {};
      if (video.active !== true || video.status !== "approved" || video.moderation !== "safe") return { success: false, message: "Video is not available for sharing", status: 403 };
      if (shareSnap.exists) return { success: true, alreadyCounted: true, status: 200 };
      const currentShares = Number(video.shares ?? 0);
      const safeShares = Number.isFinite(currentShares) && currentShares >= 0 ? Math.floor(currentShares) : 0;
      tx.create(shareRef, { videoId, userId: decoded.uid, sharedAt: Date.now() });
      tx.update(videoRef, { shares: safeShares + 1 });
      return { success: true, alreadyCounted: false, status: 200 };
    });
    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("Shorts share API error:", error);
    const code = error instanceof Error ? error.message : "";
    const status = code === "auth/id-token-expired" || code === "auth/argument-error" ? 401 : 500;
    return NextResponse.json({ success: false, message: status === 401 ? "Please sign in again" : "Unable to record share" }, { status });
  }
}
