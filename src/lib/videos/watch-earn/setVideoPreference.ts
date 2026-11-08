import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/firebase/config";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";

type Preference = 'interested' | 'notInterested';

export async function setVideoPreference(
  videoId: string,
  preference: Preference
) {
  if (!videoId || typeof videoId !== 'string') {
    return { success: false, message: "Invalid video ID" };
  }

  const user = auth.currentUser;
  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  const uid = user.uid;
  const interestedRef = doc(db, FIRESTORE_PATHS.WATCH_EARN.INTERESTED_VIDEOS, uid, "videos", videoId);
  const notInterestedRef = doc(db, FIRESTORE_PATHS.WATCH_EARN.NOT_INTERESTED_VIDEOS, uid, "videos", videoId);

  try {
    await runTransaction(db, async (transaction) => {
      if (preference === 'interested') {
        transaction.set(interestedRef, { videoId, createdAt: serverTimestamp() });
        transaction.delete(notInterestedRef);
      } else {
        transaction.set(notInterestedRef, { videoId, createdAt: serverTimestamp() });
        transaction.delete(interestedRef);
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Set preference error:", error);
    return { success: false, message: "Failed to update preference" };
  }
}
