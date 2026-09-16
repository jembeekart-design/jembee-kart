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
    actorId = (await getAdminAuth().verifyIdToken(token)).uid;
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: { videoId?: unknown; commentId?: unknown };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { videoId, commentId } = body;

  if (typeof videoId !== "string" || !videoId.trim()) {
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

    const existingSnap = await notificationRef.get();

    if (existingSnap.exists) {
      return NextResponse.json({
        success: true,
        duplicate: true,
      });
    }

    let actorDisplayName = "";
    let actorAvatarUrl = "";

    try {
      const actor = await getAdminAuth().getUser(actorId);
      actorDisplayName = actor.displayName || "";
      actorAvatarUrl = actor.photoURL || "";
    } catch {
      // Actor profile information is optional.
    }

    const now = new Date();

    const batch = db.batch();

    batch.set(notificationRef, {
      userId: creatorId,
      type: "VIDEO_COMMENT",
      actorId,
      actorDisplayName,
      actorAvatarUrl,
      videoId,
      creatorId,
      commentId: commentId || null,
      title: "New comment",
      body: actorDisplayName
        ? `${actorDisplayName} commented on your video.`
        : "Someone commented on your video.",
      isRead: false,
      createdAt: now,
      deepLink: `/mlm/watch-earn/original/${videoId}`,
    });

    const metaRef = db
      .collection(FIRESTORE_PATHS.SHORTS_NOTIFICATIONS.USER_META)
      .doc(creatorId);

    batch.set(
      metaRef,
      {
        unreadCount: FieldValue.increment(1),
        updatedAt: now,
      },
      { merge: true }
    );

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CREATE SHORTS COMMENT NOTIFICATION ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create notification" },
      { status: 500 }
    );
  }
}
