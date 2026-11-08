import {
  addDoc,
  collection
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface ReportSponsoredVideoData {
  userId: string;

  videoId: string;

  reason: string;

  message?: string;
}

export async function
reportSponsoredVideo(
  data:
  ReportSponsoredVideoData
) {

  try {

    await addDoc(
      collection(
        db,
        "videoReports"
      ),
      {
        userId:
          data.userId,

        videoId:
          data.videoId,

        reason:
          data.reason,

        message:
          data.message || "",

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
