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

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  let userId: string;

  try {
    const decodedToken = await getAdminAuth().verifyIdToken(token);
    userId = decodedToken.uid;
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: { notificationId?: unknown };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const notificationId = body.notificationId;

  if (typeof notificationId !== "string" || !notificationId.trim()) {
    return NextResponse.json(
      { success: false, message: "notificationId is required" },
      { status: 400 }
    );
  }

  try {
    const db = getAdminDb();

    const notificationRef = db
      .collection(FIRESTORE_PATHS.SHORTS_NOTIFICATIONS.ROOT)
      .doc(notificationId);

    const notificationSnap = await notificationRef.get();

    if (!notificationSnap.exists) {
      return NextResponse.json(
        { success: false, message: "Notification not found" },
        { status: 404 }
      );
    }

    const notification = notificationSnap.data();

    if (notification?.userId !== userId) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    if (notification.isRead === true) {
      return NextResponse.json({ success: true });
    }

    await db.runTransaction(async (transaction) => {
      const currentSnap = await transaction.get(notificationRef);
      const current = currentSnap.data();

      if (!currentSnap.exists || current?.userId !== userId) {
        throw new Error("NOTIFICATION_ACCESS_DENIED");
      }

      if (current.isRead !== true) {
        transaction.update(notificationRef, {
          isRead: true,
          readAt: new Date(),
        });
      }

      const metaRef = db
        .collection(FIRESTORE_PATHS.SHORTS_NOTIFICATIONS.USER_META)
        .doc(userId);

      const metaSnap = await transaction.get(metaRef);
      const currentUnread =
        typeof metaSnap.data()?.unreadCount === "number"
          ? metaSnap.data()?.unreadCount
          : 0;

      transaction.set(
        metaRef,
        {
          unreadCount: Math.max(0, currentUnread - 1),
          updatedAt: new Date(),
        },
        { merge: true }
      );
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "NOTIFICATION_ACCESS_DENIED"
    ) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    console.error("SHORTS MARK READ ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}
