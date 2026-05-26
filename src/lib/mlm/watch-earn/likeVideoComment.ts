import {
  doc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface LikeVideoCommentData {
  commentId: string;
}

export async function
likeVideoComment(
  data:
  LikeVideoCommentData
) {

  try {

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
