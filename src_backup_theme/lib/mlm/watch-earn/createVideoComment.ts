import {
  addDoc,
  collection
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface CreateVideoCommentData {
  userId: string;

  videoId: string;

  comment: string;
}

export async function
createVideoComment(
  data:
  CreateVideoCommentData
) {

  try {

    await addDoc(
      collection(
        db,
        "videoComments"
      ),
      {
        userId:
          data.userId,

        videoId:
          data.videoId,

        comment:
          data.comment,

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
