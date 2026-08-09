import {
  collection,
  getDocs,
  getDoc,
  doc,
  limit,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export interface WatchVideo {
  id: string;
  creatorId: string;
  username: string;
  displayName?: string;
  photoURL?: string;
  caption: string;
  hashtags: string[];
  music: string;
  verified: boolean;
  video: string;
  thumbnail?: string;
  productId?: string;
  coins: number;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  originalVideoId?: string;
  originalAudioId?: string;
  sponsor?: boolean;
  createdAt?: number;
}

export async function fetchWatchVideos() {
  try {
    const videosRef = collection(db, "watchEarnVideos");

    const videosQuery = query(
      videosRef,
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const snapshot = await getDocs(videosQuery);

    const videos: WatchVideo[] = [];

    // Cache user data so the same creator is not fetched repeatedly
    const creatorCache: Record<
      string,
      {
        displayName?: string;
        photoURL?: string;
      }
    > = {};

    for (const docItem of snapshot.docs) {
      const data = docItem.data();

      // IMPORTANT:
      // Firestore watchEarnVideos uses userId,
      // while frontend expects creatorId.
      const creatorId =
        data.creatorId ||
        data.userId ||
        "";

      console.log(
        "DEBUG: Processing video:",
        docItem.id,
        "creatorId:",
        creatorId,
        "userId:",
        data.userId
      );

      // --------------------------------------------------
      // VIDEO DOCUMENT DATA
      // --------------------------------------------------

      const persistedDisplayName =
        typeof data.displayName === "string"
          ? data.displayName
          : undefined;

      const persistedPhotoURL =
        typeof data.photoURL === "string"
          ? data.photoURL
          : undefined;

      const persistedPhoto =
        typeof data.photo === "string"
          ? data.photo
          : undefined;

      const persistedUsername =
        typeof data.username === "string"
          ? data.username
          : "";

      // "JembeeKart User" is treated as placeholder
      const isPlaceholder =
        persistedDisplayName === "JembeeKart User";

      // --------------------------------------------------
      // FETCH CREATOR FROM users/{creatorId}
      // --------------------------------------------------

      if (
        creatorId &&
        !creatorCache[creatorId]
      ) {
        try {
          const userRef = doc(
            db,
            "users",
            creatorId
          );

          const userSnap =
            await getDoc(userRef);

          if (userSnap.exists()) {
            const userData =
              userSnap.data();

            const firstName =
              typeof userData.firstName === "string"
                ? userData.firstName
                : "";

            const lastName =
              typeof userData.lastName === "string"
                ? userData.lastName
                : "";

            const combinedName =
              `${firstName} ${lastName}`.trim();

            creatorCache[creatorId] = {
              displayName:
                userData.displayName ||
                userData.name ||
                combinedName ||
                undefined,

              // Support both possible field names
              photoURL:
                userData.photoURL ||
                userData.photo ||
                undefined,
            };

            console.log(
              "DEBUG: User found:",
              creatorId,
              creatorCache[creatorId]
            );
          } else {
            console.warn(
              "DEBUG: User document not found:",
              creatorId
            );

            creatorCache[creatorId] = {};
          }
        } catch (userError) {
          console.error(
            "DEBUG: Failed to fetch creator:",
            creatorId,
            userError
          );

          creatorCache[creatorId] = {};
        }
      }

      // --------------------------------------------------
      // FINAL CREATOR INFORMATION
      // --------------------------------------------------

      const cachedCreator =
        creatorCache[creatorId];

      const finalDisplayName =
        cachedCreator?.displayName ||
        (!isPlaceholder
          ? persistedDisplayName
          : undefined) ||
        persistedUsername ||
        "Unknown User";

      const finalPhotoURL =
        cachedCreator?.photoURL ||
        persistedPhotoURL ||
        persistedPhoto ||
        undefined;

      console.log(
        "DEBUG: Final creator:",
        {
          creatorId,
          displayName: finalDisplayName,
          photoURL: finalPhotoURL,
        }
      );

      // --------------------------------------------------
      // CREATE WATCH VIDEO OBJECT
      // --------------------------------------------------

      videos.push({
        id: docItem.id,

        creatorId,

        username:
          persistedUsername,

        displayName:
          finalDisplayName,

        photoURL:
          finalPhotoURL,

        caption:
          typeof data.caption === "string"
            ? data.caption
            : "",

        hashtags:
          Array.isArray(data.hashtags)
            ? data.hashtags
            : [],

        music:
          typeof data.music === "string"
            ? data.music
            : "",

        verified:
          data.verified === true,

        video:
          typeof data.video === "string"
            ? data.video
            : "",

        thumbnail:
          typeof data.thumbnail === "string"
            ? data.thumbnail
            : "",

        productId:
          typeof data.productId === "string"
            ? data.productId
            : "",

        coins:
          typeof data.coins === "number"
            ? data.coins
            : 0,

        likes:
          typeof data.likes === "number"
            ? data.likes
            : 0,

        comments:
          typeof data.comments === "number"
            ? data.comments
            : 0,

        shares:
          typeof data.shares === "number"
            ? data.shares
            : 0,

        views:
          typeof data.views === "number"
            ? data.views
            : 0,

        originalVideoId:
          typeof data.originalVideoId === "string"
            ? data.originalVideoId
            : undefined,

        originalAudioId:
          typeof data.originalAudioId === "string"
            ? data.originalAudioId
            : undefined,

        sponsor:
          data.sponsor === true,

        createdAt:
          typeof data.createdAt === "number"
            ? data.createdAt
            : 0,
      });
    }

    return {
      success: true,
      videos,
    };
  } catch (error) {
    console.error(
      "FETCH WATCH VIDEOS ERROR:",
      error
    );

    return {
      success: false,
      videos: [],
    };
  }
}
