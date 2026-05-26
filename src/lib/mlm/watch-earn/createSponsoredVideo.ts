import {
  addDoc,
  collection
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface CreateSponsoredVideoData {
  sponsorName: string;

  title: string;

  description: string;

  videoUrl: string;

  thumbnail: string;

  budget: number;

  rewardCoins: number;

  minimumWatchTime: number;
}

export async function
createSponsoredVideo(
  data:
  CreateSponsoredVideoData
) {

  try {

    await addDoc(
      collection(
        db,
        "watchVideos"
      ),
      {
        sponsorName:
          data.sponsorName,

        title:
          data.title,

        description:
          data.description,

        videoUrl:
          data.videoUrl,

        thumbnail:
          data.thumbnail,

        budget:
          data.budget,

        rewardCoins:
          data.rewardCoins,

        minimumWatchTime:
          data.minimumWatchTime,

        sponsored: true,

        totalViews: 0,

        adRevenue: 0,

        active: true,

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
