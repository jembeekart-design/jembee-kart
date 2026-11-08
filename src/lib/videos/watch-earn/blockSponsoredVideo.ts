import {
  doc,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface BlockSponsoredVideoData {
  videoId: string;

  reason?: string;
}

export async function
blockSponsoredVideo(
  data:
  BlockSponsoredVideoData
) {

  try {

    await updateDoc(
      doc(
        db,
        "watchVideos",
        data.videoId
      ),
      {
        blocked: true,

        active: false,

        blockedReason:
          data.reason ||
          "Blocked by admin",

        blockedAt:
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
