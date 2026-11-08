import {
  doc,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface PauseSponsoredVideoData {
  videoId: string;

  reason?: string;
}

export async function
pauseSponsoredVideo(
  data:
  PauseSponsoredVideoData
) {

  try {

    await updateDoc(
      doc(
        db,
        "watchVideos",
        data.videoId
      ),
      {
        active: false,

        pausedReason:
          data.reason ||
          "Paused by admin",

        pausedAt:
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
