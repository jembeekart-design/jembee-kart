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

  try {
    const db = getAdminDb();

    const notificationsQuery = db
      .collection(FIRESTORE_PATHS.SHORTS_NOTIFICATIONS.ROOT)
      .where("userId", "==", userId)
      .where("isRead", "==", false);

    const snapshot = await notificationsQuery.get();

    if (!snapshot.empty) {
      const batch = db.batch();

      snapshot.docs.forEach((notificationDoc) => {
        batch.update(notificationDoc.ref, {
          isRead: true,
          readAt: new Date(),
        });
      });

      const metaRef = db
        .collection(FIRESTORE_PATHS.SHORTS_NOTIFICATIONS.USER_META)
        .doc(userId);

      batch.set(
        metaRef,
        {
          unreadCount: 0,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      await batch.commit();
    } else {
      await db
        .collection(FIRESTORE_PATHS.SHORTS_NOTIFICATIONS.USER_META)
        .doc(userId)
        .set(
          {
            unreadCount: 0,
            updatedAt: new Date(),
          },
          { merge: true }
        );
    }

    return NextResponse.json({
      success: true,
      markedCount: snapshot.size,
    });
  } catch (error) {
    console.error("SHORTS MARK ALL READ ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}
