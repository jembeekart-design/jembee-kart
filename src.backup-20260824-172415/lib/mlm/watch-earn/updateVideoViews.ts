import {
  doc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface UpdateVideoViewsData {
  videoId: string;
}

export async function
updateVideoViews(
  data:
  UpdateVideoViewsData
) {

  try {

    await updateDoc(
      doc(
        db,
        "watchVideos",
        data.videoId
      ),
      {
        totalViews:
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
