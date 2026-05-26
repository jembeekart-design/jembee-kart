import {
  doc,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface UnblockSponsoredVideoData {
  videoId: string;
}

export async function
unblockSponsoredVideo(
  data:
  UnblockSponsoredVideoData
) {

  try {

    await updateDoc(
      doc(
        db,
        "watchVideos",
        data.videoId
      ),
      {
        blocked: false,

        active: true,

        unblockedAt:
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
