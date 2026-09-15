import {
  doc,
  increment,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

interface UnlikeVideoData {
  videoId: string;
  userId: string;
}

export async function unlikeVideo({
  videoId,
  userId
}: UnlikeVideoData) {
  try {
    const likeRef = doc(db, "watchVideoLikes", `${videoId}_${userId}`);
    await deleteDoc(likeRef);

    const videoRef = doc(db, "watchEarnVideos", videoId);
    await updateDoc(videoRef, {
      likes: increment(-1)
    });

    return { success: true };
  } catch (error) {
    console.error("UNLIKE VIDEO ERROR:", error);
    return { success: false };
  }
}
