import {
  addDoc,
  collection
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface ReplyVideoCommentData {
  userId: string;

  commentId: string;

  reply: string;
}

export async function
replyVideoComment(
  data:
  ReplyVideoCommentData
) {

  try {

    await addDoc(
      collection(
        db,
        "videoCommentReplies"
      ),
      {
        userId:
          data.userId,

        commentId:
          data.commentId,

        reply:
          data.reply,

        likes: 0,

        createdAt:
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
