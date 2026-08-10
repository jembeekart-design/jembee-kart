import {
  collection,
  getDocs,
  getDoc,
  doc,
  limit,
  orderBy,
  query,
  where,
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

interface CreatorInfo {
  documentId: string;
  displayName?: string;
  username?: string;
  photoURL?: string;
}

/**
 * Safely read a string.
 */
function getString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

/**
 * Get the real creator name.
 *
 * We never use "JembeeKart User" as a real name.
 */
function getRealDisplayName(
  userData: Record<string, unknown>
): string {
  const displayName = getString(
    userData.displayName
  );

  const name = getString(
    userData.name
  );

  const firstName = getString(
    userData.firstName
  );

  const lastName = getString(
    userData.lastName
  );

  const username = getString(
    userData.username
  );

  const fullName =
    `${firstName} ${lastName}`.trim();

  if (
    displayName &&
    displayName !== "JembeeKart User"
  ) {
    return displayName;
  }

  if (
    name &&
    name !== "JembeeKart User"
  ) {
    return name;
  }

  if (fullName) {
    return fullName;
  }

  if (
    username &&
    username !== "JembeeKart User"
  ) {
    return username;
  }

  return "";
}

/**
 * Find creator inside users collection.
 *
 * It checks:
 *
 * 1. users/{creatorUid}
 * 2. users where uid == creatorUid
 * 3. users where userId == creatorUid
 * 4. users where authUid == creatorUid
 */
async function getCreatorInfo(
  creatorUid: string
): Promise<CreatorInfo | null> {
  if (!creatorUid) {
    return null;
  }

  try {
    // ==================================================
    // 1. users/{creatorUid}
    // ==================================================

    const directUserRef = doc(
      db,
      "users",
      creatorUid
    );

    const directUserSnap =
      await getDoc(directUserRef);

    if (directUserSnap.exists()) {
      const userData =
        directUserSnap.data();

      const creator: CreatorInfo = {
        documentId:
          directUserSnap.id,

        displayName:
          getRealDisplayName(userData) ||
          undefined,

        username:
          getString(
            userData.username
          ) || undefined,

        photoURL:
          getString(
            userData.photoURL
          ) ||
          getString(
            userData.photo
          ) ||
          undefined,
      };

      console.log(
        "CREATOR FOUND BY DOCUMENT ID:",
        creator
      );

      return creator;
    }

    // ==================================================
    // 2. users where uid == creatorUid
    // ==================================================

    const usersRef =
      collection(db, "users");

    const uidQuery = query(
      usersRef,
      where("uid", "==", creatorUid),
      limit(1)
    );

    const uidSnapshot =
      await getDocs(uidQuery);

    if (!uidSnapshot.empty) {
      const userDoc =
        uidSnapshot.docs[0];

      const userData =
        userDoc.data();

      const creator: CreatorInfo = {
        documentId:
          userDoc.id,

        displayName:
          getRealDisplayName(userData) ||
          undefined,

        username:
          getString(
            userData.username
          ) || undefined,

        photoURL:
          getString(
            userData.photoURL
          ) ||
          getString(
            userData.photo
          ) ||
          undefined,
      };

      console.log(
        "CREATOR FOUND BY uid FIELD:",
        creator
      );

      return creator;
    }

    // ==================================================
    // 3. users where userId == creatorUid
    // ==================================================

    const userIdQuery = query(
      usersRef,
      where(
        "userId",
        "==",
        creatorUid
      ),
      limit(1)
    );

    const userIdSnapshot =
      await getDocs(userIdQuery);

    if (!userIdSnapshot.empty) {
      const userDoc =
        userIdSnapshot.docs[0];

      const userData =
        userDoc.data();

      const creator: CreatorInfo = {
        documentId:
          userDoc.id,

        displayName:
          getRealDisplayName(userData) ||
          undefined,

        username:
          getString(
            userData.username
          ) || undefined,

        photoURL:
          getString(
            userData.photoURL
          ) ||
          getString(
            userData.photo
          ) ||
          undefined,
      };

      console.log(
        "CREATOR FOUND BY userId FIELD:",
        creator
      );

      return creator;
    }

    // ==================================================
    // 4. users where authUid == creatorUid
    // ==================================================

    const authUidQuery = query(
      usersRef,
      where(
        "authUid",
        "==",
        creatorUid
      ),
      limit(1)
    );

    const authUidSnapshot =
      await getDocs(authUidQuery);

    if (!authUidSnapshot.empty) {
      const userDoc =
        authUidSnapshot.docs[0];

      const userData =
        userDoc.data();

      const creator: CreatorInfo = {
        documentId:
          userDoc.id,

        displayName:
          getRealDisplayName(userData) ||
          undefined,

        username:
          getString(
            userData.username
          ) || undefined,

        photoURL:
          getString(
            userData.photoURL
          ) ||
          getString(
            userData.photo
          ) ||
          undefined,
      };

      console.log(
        "CREATOR FOUND BY authUid FIELD:",
        creator
      );

      return creator;
    }

    // ==================================================
    // NOT FOUND
    // ==================================================

    console.warn(
      "CREATOR NOT FOUND:",
      creatorUid
    );

    return null;
  } catch (error) {
    console.error(
      "CREATOR LOOKUP ERROR:",
      creatorUid,
      error
    );

    return null;
  }
}

/**
 * Fetch Watch & Earn videos.
 */
export async function fetchWatchVideos() {
  try {
    // ==================================================
    // WATCH VIDEOS
    // ==================================================

    const videosRef =
      collection(
        db,
        "watchEarnVideos"
      );

    const videosQuery =
      query(
        videosRef,
        orderBy(
          "createdAt",
          "desc"
        ),
        limit(50)
      );

    const snapshot =
      await getDocs(
        videosQuery
      );

    const videos: WatchVideo[] = [];

    // ==================================================
    // CREATOR CACHE
    // ==================================================

    const creatorCache: Record<
      string,
      CreatorInfo | null
    > = {};

    // ==================================================
    // PROCESS VIDEOS
    // ==================================================

    for (
      const videoDoc of snapshot.docs
    ) {
      const data =
        videoDoc.data();

      // ==================================================
      // CREATOR UID
      // ==================================================

      const creatorUid =
        getString(
          data.userId
        ) ||
        getString(
          data.creatorId
        );

      console.log(
        "WATCH VIDEO CREATOR:",
        {
          videoId:
            videoDoc.id,

          userId:
            data.userId,

          creatorId:
            data.creatorId,

          creatorUid,
        }
      );

      // ==================================================
      // VIDEO DATA
      // ==================================================

      const videoDisplayName =
        getString(
          data.displayName
        );

      const videoUsername =
        getString(
          data.username
        );

      const videoPhotoURL =
        getString(
          data.photoURL
        );

      const videoPhoto =
        getString(
          data.photo
        );

      // ==================================================
      // CREATOR LOOKUP
      // ==================================================

      if (
        creatorUid &&
        !Object.prototype.hasOwnProperty.call(
          creatorCache,
          creatorUid
        )
      ) {
        creatorCache[
          creatorUid
        ] =
          await getCreatorInfo(
            creatorUid
          );
      }

      const creator =
        creatorUid
          ? creatorCache[
              creatorUid
            ]
          : null;

      // ==================================================
      // DISPLAY NAME
      // ==================================================

      let finalDisplayName =
        creator?.displayName ||
        "";

      if (
        !finalDisplayName ||
        finalDisplayName ===
          "JembeeKart User"
      ) {
        finalDisplayName =
          creator?.username ||
          "";
      }

      if (
        !finalDisplayName &&
        videoDisplayName &&
        videoDisplayName !==
          "JembeeKart User"
      ) {
        finalDisplayName =
          videoDisplayName;
      }

      if (
        !finalDisplayName &&
        videoUsername &&
        videoUsername !==
          "JembeeKart User"
      ) {
        finalDisplayName =
          videoUsername;
      }

      if (!finalDisplayName) {
        finalDisplayName =
          "Unknown User";
      }

      // ==================================================
      // USERNAME
      // ==================================================

      const finalUsername =
        creator?.username ||
        videoUsername ||
        "";

      // ==================================================
      // PHOTO
      // ==================================================

      const finalPhotoURL =
        creator?.photoURL ||
        videoPhotoURL ||
        videoPhoto ||
        "";

      // ==================================================
      // REAL USER DOCUMENT ID
      // ==================================================

      const finalCreatorId =
        creator?.documentId ||
        creatorUid;

      // ==================================================
      // DEBUG
      // ==================================================

      console.log(
        "FINAL CREATOR:",
        {
          videoId:
            videoDoc.id,

          creatorUid,

          finalCreatorId,

          displayName:
            finalDisplayName,

          username:
            finalUsername,

          photoURL:
            finalPhotoURL,
        }
      );

      // ==================================================
      // ADD VIDEO
      // ==================================================

      videos.push({
        id:
          videoDoc.id,

        creatorId:
          finalCreatorId,

        username:
          finalUsername,

        displayName:
          finalDisplayName,

        photoURL:
          finalPhotoURL,

        caption:
          getString(
            data.caption
          ),

        hashtags:
          Array.isArray(
            data.hashtags
          )
            ? data.hashtags.filter(
                (
                  tag
                ): tag is string =>
                  typeof tag ===
                  "string"
              )
            : [],

        music:
          getString(
            data.music
          ),

        verified:
          data.verified ===
          true,

        video:
          getString(
            data.video
          ),

        thumbnail:
          getString(
            data.thumbnail
          ),

        productId:
          getString(
            data.productId
          ),

        coins:
          typeof data.coins ===
          "number"
            ? data.coins
            : 0,

        likes:
          typeof data.likes ===
          "number"
            ? data.likes
            : 0,

        comments:
          typeof data.comments ===
          "number"
            ? data.comments
            : 0,

        shares:
          typeof data.shares ===
          "number"
            ? data.shares
            : 0,

        views:
          typeof data.views ===
          "number"
            ? data.views
            : 0,

        originalVideoId:
          getString(
            data.originalVideoId
          ) ||
          undefined,

        originalAudioId:
          getString(
            data.originalAudioId
          ) ||
          undefined,

        sponsor:
          data.sponsor ===
          true,

        createdAt:
          typeof data.createdAt ===
          "number"
            ? data.createdAt
            : 0,
      });
    }

    // ==================================================
    // SUCCESS
    // ==================================================

    console.log(
      "WATCH VIDEOS LOADED:",
      videos.length
    );

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
