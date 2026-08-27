import {
  doc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface LikeVideoReplyData {
  replyId: string;
}

export async function
likeVideoReply(
  data:
  LikeVideoReplyData
) {

  try {

    await updateDoc(
      doc(
        db,
        "videoCommentReplies",
        data.replyId
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
