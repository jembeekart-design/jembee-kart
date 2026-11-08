import {
  deleteDoc,
  doc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface DeleteVideoCommentData {
  commentId: string;
}

export async function
deleteVideoComment(
  data:
  DeleteVideoCommentData
) {

  try {

    await deleteDoc(
      doc(
        db,
        "videoComments",
        data.commentId
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
