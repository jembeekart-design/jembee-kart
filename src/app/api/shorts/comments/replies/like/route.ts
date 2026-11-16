import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

async function authenticate(req: Request) {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  if (!token || token.length > 8192) return null;
  try { return (await getAdminAuth().verifyIdToken(token, true)).uid; } catch { return null; }
}

export async function POST(req: Request) {
  const uid = await authenticate(req);
  if (!uid) return fail("Unauthorized", 401);
  let body: { replyId?: unknown };
  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > 2048) return fail("Request body too large", 413);
    body = JSON.parse(raw);
    if (!body || typeof body !== "object" || Array.isArray(body)) return fail("Invalid JSON body", 400);
  } catch { return fail("Invalid JSON body", 400); }
  const replyId = typeof body.replyId === "string" ? body.replyId.trim() : "";
  if (!replyId || replyId.length > 200 || /[\\/]/.test(replyId)) return fail("Invalid reply ID", 400);

  try {
    const db = getAdminDb();
    const replyRef = db.collection("videoCommentReplies").doc(replyId);
    const likeId = createHash("sha256").update(uid).update("\0").update(replyId).digest("hex");
    const likeRef = db.collection("videoReplyLikes").doc(likeId);
    const outcome = await db.runTransaction(async (tx) => {
      const [replySnap, likeSnap] = await Promise.all([tx.get(replyRef), tx.get(likeRef)]);
      const reply = replySnap.data() || {};
      if (!replySnap.exists || reply.status !== "approved" || typeof reply.commentId !== "string" || typeof reply.contentId !== "string") return "unavailable" as const;
      const commentRef = db.collection("comments").doc(reply.commentId);
      const videoRef = db.collection("watchEarnVideos").doc(reply.contentId);
      const [commentSnap, videoSnap] = await Promise.all([tx.get(commentRef), tx.get(videoRef)]);
      const video = videoSnap.data() || {};
      if (!commentSnap.exists || commentSnap.data()?.status !== "approved" || !videoSnap.exists ||
          video.status !== "approved" || video.active !== true || video.moderation !== "safe") return "unavailable" as const;
      if (likeSnap.exists) return "already-liked" as const;
      const rawLikes = Number(reply.likes ?? 0);
      const likes = Number.isFinite(rawLikes) ? Math.max(0, Math.floor(rawLikes)) : 0;
      tx.create(likeRef, { uid, replyId, createdAt: FieldValue.serverTimestamp() });
      tx.update(replyRef, { likes: likes + 1, updatedAt: FieldValue.serverTimestamp() });
      return "liked" as const;
    });
    if (outcome === "unavailable") return fail("Reply is no longer available", 404);
    return NextResponse.json({ success: true, liked: true, alreadyLiked: outcome === "already-liked" });
  } catch (error) {
    console.error("Reply like failed:", error);
    return fail("Unable to like reply", 500);
  }
}
