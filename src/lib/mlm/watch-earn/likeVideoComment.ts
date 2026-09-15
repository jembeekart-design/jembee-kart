import {
  doc,
  increment,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface LikeVideoCommentData {
  commentId: string;
  userId: string;
}

export async function
likeVideoComment(
  data:
  LikeVideoCommentData
) {

  try {
    const likeRef = doc(db, "videoCommentLikes", `${data.commentId}_${data.userId}`);
    const likeSnap = await getDoc(likeRef);
    if (likeSnap.exists()) return { success: false, message: "Already liked" };

    await setDoc(likeRef, { commentId: data.commentId, userId: data.userId, createdAt: Date.now() });

    await updateDoc(
      doc(
        db,
        "videoComments",
        data.commentId
      ),
      {
        likes:
          increment(1),

        updatedAt:
          Date.now()
      }
    );

    return {
      success: true
    };

  } catch (error) {

    console.error(error);

    return {
      success: false
    };
  }
}

export async function
unlikeVideoComment(
  data:
  LikeVideoCommentData
) {

  try {
    const likeRef = doc(db, "videoCommentLikes", `${data.commentId}_${data.userId}`);
    await deleteDoc(likeRef);

    await updateDoc(
      doc(
        db,
        "videoComments",
        data.commentId
      ),
      {
        likes:
          increment(-1),

        updatedAt:
          Date.now()
      }
    );

    return {
      success: true
    };

  } catch (error) {

    console.error(error);

    return {
      success: false
    };
  }
}
