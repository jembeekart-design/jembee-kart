import {
  addDoc,
  collection
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface ReportVideoCommentData {
  userId: string;

  commentId: string;
  
  videoId: string;
  
  commentText: string;

  reason: string;
}

export async function
reportVideoComment(
  data:
  ReportVideoCommentData
) {

  try {

    await addDoc(
      collection(
        db,
        "videoCommentReports"
      ),
      {
        userId:
          data.userId,

        commentId:
          data.commentId,
          
        videoId:
          data.videoId,
          
        commentText:
          data.commentText,

        reason:
          data.reason,

        status:
          "pending",

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
