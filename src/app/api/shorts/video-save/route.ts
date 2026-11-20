import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";

export const POST = async (req: Request) => {
  try {
    const authorization = req.headers.get("authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const decoded = await getAdminAuth().verifyIdToken(authorization.slice(7).trim(), true);
    const body = await req.json().catch(() => null) as { videoId?: unknown; action?: unknown } | null;
    const videoId = typeof body?.videoId === "string" ? body.videoId.trim() : "";
    const action = body?.action;
    if (!videoId || videoId.length > 500 || (action !== "save" && action !== "unsave")) {
      return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
    }
    const db = getAdminDb();
    const videoRef = db.collection("watchEarnVideos").doc(videoId);
    const saveRef = db.collection("savedWatchVideos").doc(`${videoId}_${decoded.uid}`);
    const result = await db.runTransaction(async (tx) => {
      const [videoSnap, saveSnap] = await Promise.all([tx.get(videoRef), tx.get(saveRef)]);
      const video = videoSnap.data();
      if (!videoSnap.exists || video?.status !== "approved" || video?.active !== true || video?.moderation !== "safe" || video?.videoAccess !== "free") {
        return { success: false, message: "This video cannot be saved", status: 404 };
      }
      if (action === "save") {
        if (!saveSnap.exists) tx.create(saveRef, { videoId, userId: decoded.uid, createdAt: Date.now() });
        return { success: true, saved: true, status: 200 };
      }
      if (saveSnap.exists) tx.delete(saveRef);
      return { success: true, saved: false, status: 200 };
    });
    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("[VideoSave] Request failed:", error);
    return NextResponse.json({ success: false, message: "Unable to save video" }, { status: 500 });
  }
};
