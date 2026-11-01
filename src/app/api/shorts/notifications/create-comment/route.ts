import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const token = authHeader.slice("Bearer ".length).trim();

  let actorId: string;

  try {
    actorId = (await getAdminAuth().verifyIdToken(token, true)).uid;
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: { videoId?: unknown; commentId?: unknown };

  try {
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 8192) return NextResponse.json({ success: false, message: "Request body too large" }, { status: 413 });
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > 8192) return NextResponse.json({ success: false, message: "Request body too large" }, { status: 413 });
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { videoId, commentId } = body;

  if (typeof videoId !== "string" || !videoId.trim() || videoId.length > 200 || videoId.includes("/") || typeof commentId !== "string" || !commentId.trim() || commentId.length > 500 || commentId.includes("/")) {
    return NextResponse.json(
      { success: false, message: "videoId is required" },
      { status: 400 }
    );
  }

  try {
    const db = getAdminDb();

    const videoSnap = await db
      .collection("watchEarnVideos")
      .doc(videoId)
      .get();

    if (!videoSnap.exists) {
      return NextResponse.json(
        { success: false, message: "Video not found" },
        { status: 404 }
      );
    }

    const video = videoSnap.data();
    if (video?.status !== "approved" || video?.active !== true || video?.moderation !== "safe") {
      return NextResponse.json({ success: false, message: "Video is not publicly available" }, { status: 404 });
    }
    const commentSnap = await db.collection("comments").doc(commentId).get();
    const comment = commentSnap.data();
    if (!commentSnap.exists || comment?.userId !== actorId || comment?.contentId !== videoId || comment?.status !== "approved") {
      return NextResponse.json({ success: false, message: "A matching approved comment is required" }, { status: 409 });
    }
    const creatorId = video?.creatorId || video?.userId;

    if (typeof creatorId !== "string" || !creatorId) {
      return NextResponse.json(
        { success: false, message: "Video creator not found" },
        { status: 400 }
      );
    }

    if (creatorId === actorId) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "Self notification",
      });
    }

    // Use commentId if available for duplicate prevention, otherwise fallback to videoId+actorId
    const notificationId = `comment_${commentId || `${videoId}_${actorId}`}`;

    const notificationRef = db
      .collection(FIRESTORE_PATHS.SHORTS_NOTIFICATIONS.ROOT)
      .doc(notificationId);

    let actorDisplayName = "";
    let actorAvatarUrl = "";
    try {
      const actor = await getAdminAuth().getUser(actorId);
      actorDisplayName = actor.displayName || "";
      actorAvatarUrl = actor.photoURL || "";
    } catch { /* Optional profile fields. */ }
    const now = new Date();
    const metaRef = db.collection(FIRESTORE_PATHS.SHORTS_NOTIFICATIONS.USER_META).doc(creatorId);
    const created = await db.runTransaction(async (tx) => {
      const [existing, meta] = await Promise.all([tx.get(notificationRef), tx.get(metaRef)]);
      if (existing.exists) return false;
      const unread = Number(meta.data()?.unreadCount || 0);
      tx.create(notificationRef, {
        userId: creatorId, type: "VIDEO_COMMENT", actorId, actorDisplayName, actorAvatarUrl,
        videoId, creatorId, commentId, title: "New comment",
        body: actorDisplayName ? `${actorDisplayName} commented on your video.` : "Someone commented on your video.",
        isRead: false, createdAt: now, deepLink: `/mlm/watch-earn/original/${videoId}`,
      });
      tx.set(metaRef, { unreadCount: (Number.isFinite(unread) ? unread : 0) + 1, updatedAt: now }, { merge: true });
      return true;
    });
    if (!created) return NextResponse.json({ success: true, duplicate: true });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CREATE SHORTS COMMENT NOTIFICATION ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create notification" },
      { status: 500 }
    );
  }
}
