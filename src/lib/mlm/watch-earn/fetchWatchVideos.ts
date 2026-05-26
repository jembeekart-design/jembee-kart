import {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
  where
} from "firebase/firestore";

import { db }
from "@/firebase/config";

export interface WatchVideo {

  id: string;

  userId?: string;

  username: string;

  caption: string;

  hashtags: string[];

  music: string;

  verified: boolean;

  sponsor?: boolean;

  video: string;

  thumbnail?: string;

  coins: number;

  likes: number;

  comments: number;

  shares: number;

  saves?: number;

  views?: number;

  active?: boolean;

  featured?: boolean;

  status?: string;

  moderation?: string;

  createdAt?: number;
}

export async function
fetchWatchVideos() {

  try {

    /* =========================
       QUERY
    ========================= */

    const videosQuery =
      query(

        collection(
          db,
          "watchEarnVideos"
        ),

        where(
          "active",
          "==",
          true
        ),

        where(
          "status",
          "==",
          "approved"
        ),

        orderBy(
          "createdAt",
          "desc"
        ),

        limit(50)
      );

    /* =========================
       GET DOCS
    ========================= */

    const snapshot =
      await getDocs(
        videosQuery
      );

    const videos:
      WatchVideo[] = [];

    snapshot.forEach(
      (docItem) => {

        const data =
          docItem.data();

        videos.push({

          id:
            docItem.id,

          userId:
            data.userId || "",

          username:
            data.username || "",

          caption:
            data.caption || "",

          hashtags:
            data.hashtags || [],

          music:
            data.music || "",

          verified:
            data.verified || false,

          sponsor:
            data.sponsor || false,

          video:
            data.video || "",

          thumbnail:
            data.thumbnail || "",

          coins:
            data.coins || 0,

          likes:
            data.likes || 0,

          comments:
            data.comments || 0,

          shares:
            data.shares || 0,

          saves:
            data.saves || 0,

          views:
            data.views || 0,

          active:
            data.active || false,

          featured:
            data.featured || false,

          status:
            data.status || "",

          moderation:
            data.moderation || "",

          createdAt:
            data.createdAt || 0
        });
      }
    );

    return {

      success: true,

      videos
    };

  } catch (error) {

    console.error(
      "FETCH WATCH VIDEOS ERROR:",
      error
    );

    return {

      success: false,

      videos: []
    };
  }
}
