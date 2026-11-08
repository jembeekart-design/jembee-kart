import {
  doc,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface ResumeSponsoredVideoData {
  videoId: string;
}

export async function
resumeSponsoredVideo(
  data:
  ResumeSponsoredVideoData
) {

  try {

    await updateDoc(
      doc(
        db,
        "watchVideos",
        data.videoId
      ),
      {
        active: true,

        resumedAt:
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
