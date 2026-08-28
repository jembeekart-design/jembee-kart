import {
  addDoc,
  collection,
  doc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface CreateVideoAdRevenueData {
  videoId: string;

  advertiserId?: string;

  revenueAmount: number;

  views: number;
}

export async function
createVideoAdRevenue(
  data:
  CreateVideoAdRevenueData
) {

  try {

    /* =========================
       UPDATE VIDEO
    ========================= */

    await updateDoc(
      doc(
        db,
        "watchVideos",
        data.videoId
      ),
      {
        adRevenue:
          increment(
            data.revenueAmount
          ),

        monetizedViews:
          increment(
            data.views
          ),

        updatedAt:
          Date.now()
      }
    );

    /* =========================
       SAVE REVENUE HISTORY
    ========================= */

    await addDoc(
      collection(
        db,
        "videoAdRevenueHistory"
      ),
      {
        videoId:
          data.videoId,

        advertiserId:
          data.advertiserId ||
          null,

        revenueAmount:
          data.revenueAmount,

        views:
          data.views,

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
