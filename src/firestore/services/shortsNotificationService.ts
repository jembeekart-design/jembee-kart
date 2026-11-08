import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
  limit,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";

export interface ShortsNotification {
  id: string;
  userId: string;
  type: string;
  actorId?: string;
  actorDisplayName?: string;
  actorAvatarUrl?: string;
  videoId?: string;
  commentId?: string;
  creatorId?: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt?: unknown;
  deepLink?: string;
  metadata?: Record<string, unknown>;
}

export function subscribeToShortsNotifications(
  userId: string,
  callback: (notifications: ShortsNotification[]) => void,
  onError?: (error: Error) => void
) {
  if (!userId) {
    callback([]);
    return () => {};
  }

  const notificationsQuery = query(
    collection(db, FIRESTORE_PATHS.SHORTS_NOTIFICATIONS.ROOT),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(50)
  );

  return onSnapshot(
    notificationsQuery,
    (snapshot) => {
      const notifications = snapshot.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<ShortsNotification, "id">),
      }));

      callback(notifications);
    },
    (error) => {
      console.error("SHORTS NOTIFICATIONS ERROR:", error);
      onError?.(error);
    }
  );
}

export function subscribeToShortsUnreadCount(
  userId: string,
  callback: (count: number) => void,
  onError?: (error: Error) => void
) {
  if (!userId) {
    callback(0);
    return () => {};
  }

  const metaRef = doc(
    db,
    FIRESTORE_PATHS.SHORTS_NOTIFICATIONS.USER_META,
    userId
  );

  return onSnapshot(
    metaRef,
    (snapshot) => {
      const data = snapshot.data();
      const count =
        typeof data?.unreadCount === "number" && data.unreadCount > 0
          ? data.unreadCount
          : 0;

      callback(count);
    },
    (error) => {
      console.error("SHORTS UNREAD META ERROR:", error);
      onError?.(error);
    }
  );
}
