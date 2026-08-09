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

type CreatorInfo = {
  documentId: string;
  displayName?: string;
  username?: string;
  photoURL?: string;
};

/**
 * Returns a real user name.
 *
 * "JembeeKart User" is only a placeholder,
 * so it must never be used as the creator's name.
 */
function getRealDisplayName(userData: Record<string, unknown>) {
  const displayName =
    typeof userData.displayName === "string"
      ? userData.displayName.trim()
      : "";

  const name =
    typeof userData.name === "string"
      ? userData.name.trim()
      : "";

  const firstName =
    typeof userData.firstName === "string"
      ? userData.firstName.trim()
      : "";

  const lastName =
    typeof userData.lastName === "string"
      ? userData.lastName.trim()
      : "";

  const username =
    typeof userData.username === "string"
      ? userData.username.trim()
      : "";

  const fullName =
    `${firstName} ${lastName}`.trim();

  // Never return the placeholder.
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

  return undefined;
}

export async function fetchWatchVideos() {
  try {
    const videosRef = collection(
      db,
      "watchEarnVideos"
    );

    const videosQuery = query(
      videosRef,
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const snapshot = await getDocs(
      videosQuery
    );

    const videos: WatchVideo[] = [];

    /**
     * Cache creator information.
     *
     * Key = UID stored inside watchEarnVideos
     */
    const creatorCache: Record<
      string,
      CreatorInfo | null
    > = {};

    for (const videoDoc of snapshot.docs) {
      const data = videoDoc.data();

      /**
       * --------------------------------------------------
       * 1. GET CREATOR UID
       * --------------------------------------------------
       */

      const creatorUid =
        typeof data.creatorId === "string" &&
        data.creatorId.trim()
          ? data.creatorId.trim()
          : typeof data.userId === "string" &&
              data.userId.trim()
            ? data.userId.trim()
            : "";

      console.log(
        "WATCH VIDEO:",
        videoDoc.id,
        "creatorUid:",
        creatorUid,
        "creatorId:",
        data.creatorId,
        "userId:",
        data.userId
      );

      /**
       * --------------------------------------------------
       * 2. VIDEO-LEVEL DATA
       * --------------------------------------------------
       */

      const persistedDisplayName =
        typeof data.displayName === "string"
          ? data.displayName.trim()
          : "";

      const persistedUsername =
        typeof data.username === "string"
          ? data.username.trim()
          : "";

      const persistedPhotoURL =
        typeof data.photoURL === "string"
          ? data.photoURL.trim()
          : "";

      const persistedPhoto =
        typeof data.photo === "string"
          ? data.photo.trim()
          : "";

      /**
       * "JembeeKart User" is NOT a real creator name.
       */
      const isPlaceholder =
        persistedDisplayName ===
        "JembeeKart User";

      /**
       * --------------------------------------------------
       * 3. FIND USER DOCUMENT
       * --------------------------------------------------
       *
       * First:
       * users/{creatorUid}
       *
       * If not found:
       * users where uid == creatorUid
       */

      if (
        creatorUid &&
        !(creatorUid in creatorCache)
      ) {
        let creator: CreatorInfo | null = null;

        try {
          /**
           * ----------------------------------------------
           * FIRST: Try users/{creatorUid}
           * ----------------------------------------------
           */

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

            const realDisplayName =
              getRealDisplayName(
                userData
              );

            creator = {
              documentId:
                directUserSnap.id,

              displayName:
                realDisplayName,

              username:
                typeof userData.username ===
                "string"
                  ? userData.username.trim()
                  : undefined,

              photoURL:
                typeof userData.photoURL ===
                "string"
                  ? userData.photoURL.trim()
                  : typeof userData.photo ===
                      "string"
                    ? userData.photo.trim()
                    : undefined,
            };

            console.log(
              "USER FOUND BY DOCUMENT ID:",
              {
                creator,
                realDisplayName,
              }
            );
          }

          /**
           * ----------------------------------------------
           * SECOND: Search users by uid field
           * ----------------------------------------------
           */

          if (!creator) {
            const usersRef = collection(
              db,
              "users"
            );

            const uidQuery = query(
              usersRef,
              where(
                "uid",
                "==",
                creatorUid
              ),
              limit(1)
            );

            const uidSnapshot =
              await getDocs(uidQuery);

            if (
              !uidSnapshot.empty
            ) {
              const userDoc =
                uidSnapshot.docs[0];

              const userData =
                userDoc.data();

              const realDisplayName =
                getRealDisplayName(
                  userData
                );

              creator = {
                /**
                 * IMPORTANT:
                 *
                 * Actual users document ID.
                 *
                 * FollowButton uses this ID.
                 */
                documentId:
                  userDoc.id,

                displayName:
                  realDisplayName,

                username:
                  typeof userData.username ===
                  "string"
                    ? userData.username.trim()
                    : undefined,

                photoURL:
                  typeof userData.photoURL ===
                  "string"
                    ? userData.photoURL.trim()
                    : typeof userData.photo ===
                        "string"
                      ? userData.photo.trim()
                      : undefined,
              };

              console.log(
                "USER FOUND BY UID FIELD:",
                {
                  creatorUid,
                  creator,
                  realDisplayName,
                }
              );
            }
          }

          /**
           * User could not be found.
           */
          if (!creator) {
            console.warn(
              "USER NOT FOUND:",
              creatorUid
            );
          }
        } catch (userError) {
          console.error(
            "CREATOR LOOKUP ERROR:",
            creatorUid,
            userError
          );
        }

        creatorCache[creatorUid] =
          creator;
      }

      /**
       * --------------------------------------------------
       * 4. CREATOR DATA
       * --------------------------------------------------
       */

      const creator =
        creatorUid
          ? creatorCache[creatorUid]
          : null;

      /**
       * Use actual users document ID.
       *
       * This is important for FollowButton.
       */
      const finalCreatorId =
        creator?.documentId ||
        creatorUid;

      /**
       * --------------------------------------------------
       * 5. FINAL DISPLAY NAME
       * --------------------------------------------------
       *
       * Priority:
       *
       * 1. users.displayName
       * 2. users.name
       * 3. users.firstName + lastName
       * 4. users.username
       * 5. video username
       * 6. Unknown User
       *
       * "JembeeKart User" is NEVER accepted.
       */

      let finalDisplayName =
        creator?.displayName?.trim() || "";

      if (
        !finalDisplayName ||
        finalDisplayName ===
          "JembeeKart User"
      ) {
        finalDisplayName =
          creator?.username?.trim() || "";
      }

      if (
        !finalDisplayName &&
        persistedDisplayName &&
        !isPlaceholder
      ) {
        finalDisplayName =
          persistedDisplayName;
      }

      if (
        !finalDisplayName &&
        persistedUsername &&
        persistedUsername !==
          "JembeeKart User"
      ) {
        finalDisplayName =
          persistedUsername;
      }

      if (!finalDisplayName) {
        finalDisplayName =
          "Unknown User";
      }

      /**
       * --------------------------------------------------
       * 6. FINAL PHOTO
       * --------------------------------------------------
       */

      const finalPhotoURL =
        creator?.photoURL ||
        persistedPhotoURL ||
        persistedPhoto ||
        undefined;

      /**
       * --------------------------------------------------
       * 7. FINAL USERNAME
       * --------------------------------------------------
       */

      const finalUsername =
        creator?.username ||
        persistedUsername ||
        "";

      console.log(
        "FINAL VIDEO CREATOR:",
        {
          videoId:
            videoDoc.id,

          creatorUid,

          creatorDocumentId:
            creator?.documentId,

          finalCreatorId,

          displayName:
            finalDisplayName,

          username:
            finalUsername,

          photoURL:
            finalPhotoURL,
        }
      );

      /**
       * --------------------------------------------------
       * 8. BUILD VIDEO OBJECT
       * --------------------------------------------------
       */

      videos.push({
        id:
          videoDoc.id,

        /**
         * Actual users document ID.
         *
         * FollowButton receives this.
         */
        creatorId:
          finalCreatorId,

        username:
          finalUsername,

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
            ? data.hashtags.filter(
                (
                  tag
                ): tag is string =>
                  typeof tag ===
                  "string"
              )
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
          typeof data.originalVideoId ===
          "string"
            ? data.originalVideoId
            : undefined,

        originalAudioId:
          typeof data.originalAudioId ===
          "string"
            ? data.originalAudioId
            : undefined,

        sponsor:
          data.sponsor === true,

        createdAt:
          typeof data.createdAt ===
          "number"
            ? data.createdAt
            : 0,
      });
    }

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
