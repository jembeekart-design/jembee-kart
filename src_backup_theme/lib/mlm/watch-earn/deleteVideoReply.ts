import {
  deleteDoc,
  doc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface DeleteVideoReplyData {
  replyId: string;
}

export async function
deleteVideoReply(
  data:
  DeleteVideoReplyData
) {

  try {

    await deleteDoc(
      doc(
        db,
        "videoCommentReplies",
        data.replyId
      )
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
