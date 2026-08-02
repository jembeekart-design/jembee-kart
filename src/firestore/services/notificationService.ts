import {
  collection,
  doc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy
} from "firebase/firestore";
import { db } from "@/firebase/config";

const NOTIFICATIONS_COLLECTION = "notifications";

export async function getUnreadCount(userId: string, callback: (count: number) => void) {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where("userId", "==", userId),
    where("read", "==", false)
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  });
}

export async function markNotificationAsRead(notificationId: string) {
  const ref = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
  await updateDoc(ref, { read: true });
}
