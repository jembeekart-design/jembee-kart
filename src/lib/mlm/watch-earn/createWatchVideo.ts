import {
  addDoc,
  collection
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface CreateWatchVideoData {
  title: string;

  description: string;

  videoUrl: string;

  thumbnail: string;
}

export async function
createWatchVideo(
  data:
  CreateWatchVideoData
) {

  try {

    await addDoc(
      collection(
        db,
        "watchVideos"
      ),
      {
        title:
          data.title,

        description:
          data.description,

        videoUrl:
          data.videoUrl,

        thumbnail:
          data.thumbnail,

        totalViews: 0,

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
