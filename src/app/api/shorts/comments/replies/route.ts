import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

async function getUid(req: Request) {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  if (!token || token.length > 8192) return null;
  try {
    return (await getAdminAuth().verifyIdToken(token, true)).uid;
  } catch {
    return null;
  }
}

function validId(value: unknown, max = 200): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= max && !/[\\/]/.test(value);
}

export async function GET(req: Request) {
  const uid = await getUid(req);
  if (!uid) return fail("Unauthorized", 401);
  const commentId = new URL(req.url).searchParams.get("commentId");
  if (!validId(commentId, 500)) return fail("Invalid comment ID", 400);

  try {
    const db = getAdminDb();
    const comment = await db.collection("comments").doc(commentId).get();
    if (!comment.exists || comment.data()?.status !== "approved") return fail("Comment not available", 404);
    const contentId = comment.data()?.contentId;
    if (!validId(contentId, 200)) return fail("Comment not available", 404);
    const video = await db.collection("watchEarnVideos").doc(contentId).get();
    const videoData = video.data() || {};
    if (!video.exists || videoData.status !== "approved" || videoData.active !== true || videoData.moderation !== "safe") {
      return fail("Replies are unavailable for this video", 404);
    }
    const snapshot = await db.collection("videoCommentReplies").where("commentId", "==", commentId).limit(150).get();
    const replies = snapshot.docs
      .filter((item) => item.data().status === "approved")
      .map((item) => {
        const data = item.data();
        const createdAt = data.createdAt?.toDate?.()?.toISOString?.() ?? null;
        return {
          id: item.id,
          userId: typeof data.userId === "string" ? data.userId : "",
          userName: typeof data.userName === "string" ? data.userName : "User",
          reply: typeof data.reply === "string" ? data.reply : "",
          likes: Number.isFinite(Number(data.likes)) ? Math.max(0, Math.floor(Number(data.likes))) : 0,
          createdAt,
        };
      })
      .sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));
    return NextResponse.json({ success: true, replies, hasMore: snapshot.size >= 150 });
  } catch (error) {
    console.error("Comment replies read failed:", error);
    return fail("Unable to load replies", 500);
  }
}

export async function POST(req: Request) {
  const uid = await getUid(req);
  if (!uid) return fail("Unauthorized", 401);

  let body: { commentId?: unknown; reply?: unknown; requestId?: unknown };
  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > 8192) return fail("Request body too large", 413);
    body = JSON.parse(raw);
    if (!body || typeof body !== "object" || Array.isArray(body)) return fail("Invalid JSON body", 400);
  } catch {
    return fail("Invalid JSON body", 400);
  }

  const commentId = body.commentId;
  const reply = typeof body.reply === "string" ? body.reply.trim() : "";
  const requestId = typeof body.requestId === "string" ? body.requestId.trim() : "";
  if (!validId(commentId, 500) || !reply || reply.length > 1000 ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
    return fail("Comment ID, reply text and request ID are required", 400);
  }

  try {
    const db = getAdminDb();
    const settingsSnap = await db.collection("commentModeration").doc("settings").get();
    if (!settingsSnap.exists) return fail("Comment moderation settings are not configured", 503);
    const settings = settingsSnap.data() || {};
    if (settings.enabled !== true || settings.commentsEnabled !== true) return fail("Replies are currently disabled", 403);
    const maxLength = Number.isFinite(Number(settings.maxReplyLength)) ? Math.max(1, Math.min(1000, Number(settings.maxReplyLength))) : 500;
    if (reply.length > maxLength) return fail(`Reply exceeds the ${maxLength}-character limit`, 400);

    const normalized = settings.caseInsensitive === false ? reply : reply.toLowerCase();
    const blockedWords = Array.isArray(settings.blockedWords) ? settings.blockedWords.filter((word: unknown): word is string => typeof word === "string" && word.trim()) : [];
    for (const word of blockedWords) {
      const needle = settings.caseInsensitive === false ? word.trim() : word.trim().toLowerCase();
      const blocked = settings.blockPartialMatch === false ? normalized.split(/\s+/).includes(needle) : normalized.includes(needle);
      if (blocked) return fail(typeof settings.customMessage === "string" && settings.customMessage ? settings.customMessage : "Please avoid abusive language", 400);
    }
    const regexRules = await db.collection("commentRegexRules").where("enabled", "==", true).limit(1).get();
    if (!regexRules.empty) return fail("Custom regex moderation is temporarily unavailable", 503);

    const commentRef = db.collection("comments").doc(commentId);
    const commentSnap = await commentRef.get();
    if (!commentSnap.exists || commentSnap.data()?.status !== "approved") return fail("Comment not available", 404);
    const commentData = commentSnap.data() || {};
    const videoId = commentData.contentId;
    if (!validId(videoId, 200)) return fail("Comment not available", 404);
    const videoRef = db.collection("watchEarnVideos").doc(videoId);
    const videoSnap = await videoRef.get();
    const videoData = videoSnap.data() || {};
    if (!videoSnap.exists || videoData.status !== "approved" || videoData.active !== true || videoData.moderation !== "safe") {
      return fail("Replies are unavailable for this video", 404);
    }

    let userName = "User";
    try {
      const user = await getAdminAuth().getUser(uid);
      userName = user.displayName || "User";
    } catch {
      // Keep the reply available if optional profile metadata is missing.
    }

    const requestHash = createHash("sha256").update(uid).update("\0").update(requestId).digest("hex");
    const replyRef = db.collection("videoCommentReplies").doc(requestHash);
    const rateRef = db.collection("commentReplyRateLimits").doc(uid);
    const now = Date.now();
    const autoApprove = settings.autoApproveReplies === true || (settings.autoApproveReplies !== false && settings.autoApproveComments === true);
    const result = await db.runTransaction(async (tx) => {
      const [existing, freshComment, freshVideo, rate] = await Promise.all([
        tx.get(replyRef),
        tx.get(commentRef),
        tx.get(videoRef),
        tx.get(rateRef),
      ]);
      if (existing.exists) return { kind: "duplicate" as const };
      const freshCommentData = freshComment.data() || {};
      const freshVideoData = freshVideo.data() || {};
      if (!freshComment.exists || freshCommentData.status !== "approved" || freshCommentData.contentId !== videoId ||
          !freshVideo.exists || freshVideoData.status !== "approved" ||
          freshVideoData.active !== true || freshVideoData.moderation !== "safe") {
        return { kind: "unavailable" as const };
      }
      const rateData = rate.data() || {};
      const window = Math.floor(now / 60000);
      const rawCount = Number(rateData.count || 0);
      const count = rateData.window === window && Number.isFinite(rawCount) ? Math.max(0, Math.floor(rawCount)) : 0;
      if (count >= 5) return { kind: "rate-limited" as const };
      tx.create(replyRef, {
        commentId,
        contentId: videoId,
        userId: uid,
        userName,
        reply,
        likes: 0,
        status: autoApprove ? "approved" : "pending",
        createdAt: FieldValue.serverTimestamp(),
        requestId,
      });
      tx.update(commentRef, { replyCount: FieldValue.increment(1) });
      tx.set(rateRef, { window, count: count + 1, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      return { kind: "created" as const };
    });

    if (result.kind === "rate-limited") return fail("Reply rate limit reached. Please try again later.", 429);
    if (result.kind === "unavailable") return fail("Replies are unavailable for this comment", 404);
    return NextResponse.json({ success: true, duplicate: result.kind === "duplicate", reply: result.kind === "created" ? { id: replyRef.id, commentId, userId: uid, userName, reply, status: autoApprove ? "approved" : "pending", likes: 0 } : null });
  } catch (error) {
    console.error("Comment reply submission failed:", error);
    return fail("Unable to submit reply right now", 500);
  }
}
