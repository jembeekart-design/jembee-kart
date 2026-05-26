import {
  deleteDoc,
  doc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface DeleteSponsoredVideoData {
  videoId: string;
}

export async function
deleteSponsoredVideo(
  data:
  DeleteSponsoredVideoData
) {

  try {

    await deleteDoc(
      doc(
        db,
        "watchVideos",
        data.videoId
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
