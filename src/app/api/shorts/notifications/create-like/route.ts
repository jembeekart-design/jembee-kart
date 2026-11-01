import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";

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

  let body: { videoId?: unknown };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const videoId = body.videoId;

  if (typeof videoId !== "string" || !videoId.trim() || videoId.length > 200 || videoId.includes("/")) {
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
    const likeSnap = await db.collection("watchVideoLikes").doc(`${videoId}_${actorId}`).get();
    if (!likeSnap.exists) {
      return NextResponse.json({ success: false, message: "A matching like is required" }, { status: 409 });
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

    const notificationId = `like_${videoId}_${actorId}`;

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
        userId: creatorId, type: "VIDEO_LIKE", actorId, actorDisplayName, actorAvatarUrl,
        videoId, creatorId, title: "New like",
        body: actorDisplayName ? `${actorDisplayName} liked your video.` : "Someone liked your video.",
        isRead: false, createdAt: now, deepLink: `/mlm/watch-earn/original/${videoId}`,
      });
      tx.set(metaRef, { unreadCount: (Number.isFinite(unread) ? unread : 0) + 1, updatedAt: now }, { merge: true });
      return true;
    });
    if (!created) return NextResponse.json({ success: true, duplicate: true });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CREATE SHORTS LIKE NOTIFICATION ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create notification" },
      { status: 500 }
    );
  }
}
