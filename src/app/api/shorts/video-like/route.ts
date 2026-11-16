import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getAdminDb, getAdminAuth } from "@/firebase/admin";

export const runtime = "nodejs";

function error(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(req: Request) {
  const authorization = req.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return error("Authentication required", 401);
  const token = authorization.slice(7).trim();
  if (!token || token.length > 8192) return error("Invalid authentication token", 401);

  let uid: string;
  try {
    uid = (await getAdminAuth().verifyIdToken(token, true)).uid;
  } catch {
    return error("Please sign in again", 401);
  }

  let body: { videoId?: unknown; action?: unknown };
  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > 4096) return error("Request body too large", 413);
    body = JSON.parse(raw);
  } catch {
    return error("Invalid JSON body", 400);
  }

  const videoId = typeof body.videoId === "string" ? body.videoId.trim() : "";
  const action = body.action;
  if (!videoId || videoId.length > 200 || /[\\/]/.test(videoId) || !["like", "unlike"].includes(String(action))) {
    return error("Invalid request", 400);
  }

  try {
    const db = getAdminDb();
    const videoRef = db.collection("watchEarnVideos").doc(videoId);
    const likeId = createHash("sha256").update(uid).update("\0").update(videoId).digest("hex");
    const likeRef = db.collection("watchVideoLikes").doc(likeId);

    const result = await db.runTransaction(async (tx) => {
      const [videoSnap, likeSnap] = await Promise.all([tx.get(videoRef), tx.get(likeRef)]);
      if (!videoSnap.exists) return { success: false, message: "Video not found", status: 404 };
      const video = videoSnap.data() ?? {};
      if (video.active !== true || video.status !== "approved" || video.moderation !== "safe") {
        return { success: false, message: "Video is not available for interaction", status: 403 };
      }
      const count = Number(video.likes ?? 0);
      const safeCount = Number.isFinite(count) && count >= 0 ? Math.floor(count) : 0;
      if (action === "like") {
        if (likeSnap.exists) return { success: true, alreadyLiked: true, status: 200 };
        tx.create(likeRef, { videoId, userId: uid, createdAt: Date.now() });
        tx.update(videoRef, { likes: safeCount + 1 });
        return { success: true, alreadyLiked: false, status: 200 };
      }
      if (!likeSnap.exists) return { success: true, alreadyLiked: false, status: 200 };
      tx.delete(likeRef);
      tx.update(videoRef, { likes: Math.max(0, safeCount - 1) });
      return { success: true, alreadyLiked: false, status: 200 };
    });
    return NextResponse.json(result, { status: result.status });
  } catch (err) {
    console.error("Shorts like API error:", err);
    return error("Unable to update like", 500);
  }
}
