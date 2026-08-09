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
       *
       * Some old documents may use creatorId.
       * Current watchEarnVideos documents use userId.
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
       * 2. VIDEO-LEVEL USER DATA
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

      const isPlaceholder =
        persistedDisplayName ===
        "JembeeKart User";

      /**
       * --------------------------------------------------
       * 3. FIND USER DOCUMENT
       * --------------------------------------------------
       *
       * Important:
       *
       * creatorUid may NOT be the users document ID.
       *
       * Example:
       *
       * users
       *   └── ABCXYZ123       <-- document ID
       *        uid: "firebaseAuthUid"
       *
       * Therefore we first try:
       *
       * users/{creatorUid}
       *
       * and if that doesn't exist:
       *
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
           * FIRST: Try document ID
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

            creator = {
              documentId:
                directUserSnap.id,

              displayName:
                typeof userData.displayName ===
                "string"
                  ? userData.displayName
                  : typeof userData.name ===
                      "string"
                    ? userData.name
                    : undefined,

              username:
                typeof userData.username ===
                "string"
                  ? userData.username
                  : undefined,

              photoURL:
                typeof userData.photoURL ===
                "string"
                  ? userData.photoURL
                  : typeof userData.photo ===
                      "string"
                    ? userData.photo
                    : undefined,
            };

            console.log(
              "USER FOUND BY DOCUMENT ID:",
              creator
            );
          }

          /**
           * ----------------------------------------------
           * SECOND: Search by uid field
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

              creator = {
                /**
                 * VERY IMPORTANT:
                 *
                 * Return the actual users
                 * document ID.
                 *
                 * FollowButton needs this
                 * because followService uses:
                 *
                 * users/{targetUid}
                 */
                documentId:
                  userDoc.id,

                displayName:
                  typeof userData.displayName ===
                  "string"
                    ? userData.displayName
                    : typeof userData.name ===
                        "string"
                      ? userData.name
                      : undefined,

                username:
                  typeof userData.username ===
                  "string"
                    ? userData.username
                    : undefined,

                photoURL:
                  typeof userData.photoURL ===
                  "string"
                    ? userData.photoURL
                    : typeof userData.photo ===
                        "string"
                      ? userData.photo
                      : undefined,
              };

              console.log(
                "USER FOUND BY UID FIELD:",
                {
                  creatorUid,
                  creator,
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
       * If the user document exists,
       * use its ACTUAL document ID.
       *
       * Otherwise fall back to creatorUid.
       */
      const finalCreatorId =
        creator?.documentId ||
        creatorUid;

      /**
       * Name priority:
       *
       * users.displayName
       * users.name
       * video.displayName
       * video.username
       * fallback
       */
      const finalDisplayName =
        creator?.displayName ||
        (!isPlaceholder
          ? persistedDisplayName
          : "") ||
        creator?.username ||
        persistedUsername ||
        "Unknown User";

      /**
       * Photo priority:
       *
       * users.photoURL
       * users.photo
       * video.photoURL
       * video.photo
       */
      const finalPhotoURL =
        creator?.photoURL ||
        persistedPhotoURL ||
        persistedPhoto ||
        undefined;

      /**
       * Username
       */
      const finalUsername =
        creator?.username ||
        persistedUsername ||
        "";

      console.log(
        "FINAL VIDEO CREATOR:",
        {
          videoId: videoDoc.id,
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
       * 5. BUILD VIDEO OBJECT
       * --------------------------------------------------
       */

      videos.push({
        id: videoDoc.id,

        /**
         * IMPORTANT:
         *
         * This is now the actual users
         * document ID whenever available.
         *
         * FollowButton will receive this.
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
                (tag): tag is string =>
                  typeof tag === "string"
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
