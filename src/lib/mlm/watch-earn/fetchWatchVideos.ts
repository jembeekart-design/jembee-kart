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

/* =====================================================
   SAFE STRING
===================================================== */

function getString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

/* =====================================================
   REAL DISPLAY NAME
===================================================== */

function getRealDisplayName(
  userData: Record<string, unknown>
): string {
  const displayName =
    getString(userData.displayName);

  const name =
    getString(userData.name);

  const firstName =
    getString(userData.firstName);

  const lastName =
    getString(userData.lastName);

  const username =
    getString(userData.username);

  const fullName =
    `${firstName} ${lastName}`.trim();

  if (
    displayName &&
    displayName !== "JembeeKart User" &&
    displayName !== "Unknown User"
  ) {
    return displayName;
  }

  if (
    name &&
    name !== "JembeeKart User" &&
    name !== "Unknown User"
  ) {
    return name;
  }

  if (fullName) {
    return fullName;
  }

  if (
    username &&
    username !== "JembeeKart User" &&
    username !== "Unknown User"
  ) {
    return username;
  }

  return "";
}

/* =====================================================
   CREATE CREATOR OBJECT
===================================================== */

function makeCreatorInfo(
  documentId: string,
  userData: Record<string, unknown>
): CreatorInfo {
  return {
    documentId,

    displayName:
      getRealDisplayName(userData) ||
      undefined,

    username:
      getString(userData.username) ||
      getString(userData.userName) ||
      undefined,

    photoURL:
      getString(userData.photoURL) ||
      getString(userData.photo) ||
      getString(userData.profilePhoto) ||
      undefined,
  };
}

/* =====================================================
   CHECK USER DATA FOR ID
===================================================== */

function userDataContainsId(
  userData: Record<string, unknown>,
  creatorUid: string
): boolean {
  const possibleFields = [
    "uid",
    "userId",
    "authUid",
    "firebaseUid",
    "firebaseUserId",
    "authUserId",
    "userUid",
    "ownerId",
    "creatorId",
    "publicId",
  ];

  for (const field of possibleFields) {
    const value =
      getString(userData[field]);

    if (
      value &&
      value === creatorUid
    ) {
      return true;
    }
  }

  return false;
}

/* =====================================================
   FIND CREATOR
===================================================== */

async function getCreatorInfo(
  creatorUid: string,
  videoUsername: string
): Promise<CreatorInfo | null> {
  if (!creatorUid && !videoUsername) {
    return null;
  }

  try {
    const usersRef =
      collection(db, "users");

    /* =================================================
       1. DIRECT DOCUMENT ID
    ================================================= */

    if (creatorUid) {
      const directRef =
        doc(
          db,
          "users",
          creatorUid
        );

      const directSnap =
        await getDoc(directRef);

      if (directSnap.exists()) {
        const userData =
          directSnap.data();

        const creator =
          makeCreatorInfo(
            directSnap.id,
            userData
          );

        console.log(
          "CREATOR FOUND BY DOCUMENT ID:",
          creator
        );

        return creator;
      }
    }

    /* =================================================
       2. SEARCH BY uid
    ================================================= */

    if (creatorUid) {
      try {
        const q =
          query(
            usersRef,
            where(
              "uid",
              "==",
              creatorUid
            ),
            limit(1)
          );

        const snap =
          await getDocs(q);

        if (!snap.empty) {
          const userDoc =
            snap.docs[0];

          const creator =
            makeCreatorInfo(
              userDoc.id,
              userDoc.data()
            );

          console.log(
            "CREATOR FOUND BY uid:",
            creator
          );

          return creator;
        }
      } catch (error) {
        console.warn(
          "uid QUERY FAILED:",
          error
        );
      }
    }

    /* =================================================
       3. SEARCH BY userId
    ================================================= */

    if (creatorUid) {
      try {
        const q =
          query(
            usersRef,
            where(
              "userId",
              "==",
              creatorUid
            ),
            limit(1)
          );

        const snap =
          await getDocs(q);

        if (!snap.empty) {
          const userDoc =
            snap.docs[0];

          const creator =
            makeCreatorInfo(
              userDoc.id,
              userDoc.data()
            );

          console.log(
            "CREATOR FOUND BY userId:",
            creator
          );

          return creator;
        }
      } catch (error) {
        console.warn(
          "userId QUERY FAILED:",
          error
        );
      }
    }

    /* =================================================
       4. SEARCH BY authUid
    ================================================= */

    if (creatorUid) {
      try {
        const q =
          query(
            usersRef,
            where(
              "authUid",
              "==",
              creatorUid
            ),
            limit(1)
          );

        const snap =
          await getDocs(q);

        if (!snap.empty) {
          const userDoc =
            snap.docs[0];

          const creator =
            makeCreatorInfo(
              userDoc.id,
              userDoc.data()
            );

          console.log(
            "CREATOR FOUND BY authUid:",
            creator
          );

          return creator;
        }
      } catch (error) {
        console.warn(
          "authUid QUERY FAILED:",
          error
        );
      }
    }

    /* =================================================
       5. SEARCH BY firebaseUid
    ================================================= */

    if (creatorUid) {
      try {
        const q =
          query(
            usersRef,
            where(
              "firebaseUid",
              "==",
              creatorUid
            ),
            limit(1)
          );

        const snap =
          await getDocs(q);

        if (!snap.empty) {
          const userDoc =
            snap.docs[0];

          const creator =
            makeCreatorInfo(
              userDoc.id,
              userDoc.data()
            );

          console.log(
            "CREATOR FOUND BY firebaseUid:",
            creator
          );

          return creator;
        }
      } catch (error) {
        console.warn(
          "firebaseUid QUERY FAILED:",
          error
        );
      }
    }

    /* =================================================
       6. SEARCH BY USERNAME
    ================================================= */

    if (videoUsername) {
      try {
        const q =
          query(
            usersRef,
            where(
              "username",
              "==",
              videoUsername
            ),
            limit(1)
          );

        const snap =
          await getDocs(q);

        if (!snap.empty) {
          const userDoc =
            snap.docs[0];

          const creator =
            makeCreatorInfo(
              userDoc.id,
              userDoc.data()
            );

          console.log(
            "CREATOR FOUND BY USERNAME:",
            creator
          );

          return creator;
        }
      } catch (error) {
        console.warn(
          "USERNAME QUERY FAILED:",
          error
        );
      }
    }

    /* =================================================
       7. FINAL FALLBACK
       
       Scan users collection and compare all common
       identity fields.
    ================================================= */

    console.log(
      "RUNNING FINAL USER SCAN:",
      {
        creatorUid,
        videoUsername,
      }
    );

    const allUsersSnapshot =
      await getDocs(usersRef);

    for (
      const userDoc of allUsersSnapshot.docs
    ) {
      const userData =
        userDoc.data();

      /* ---------------------------------------------
         Match creator ID
      --------------------------------------------- */

      if (
        creatorUid &&
        userDataContainsId(
          userData,
          creatorUid
        )
      ) {
        const creator =
          makeCreatorInfo(
            userDoc.id,
            userData
          );

        console.log(
          "CREATOR FOUND BY FINAL ID SCAN:",
          creator
        );

        return creator;
      }

      /* ---------------------------------------------
         Match username
      --------------------------------------------- */

      if (
        videoUsername &&
        getString(
          userData.username
        ) === videoUsername
      ) {
        const creator =
          makeCreatorInfo(
            userDoc.id,
            userData
          );

        console.log(
          "CREATOR FOUND BY FINAL USERNAME SCAN:",
          creator
        );

        return creator;
      }
    }

    console.warn(
      "CREATOR COMPLETELY NOT FOUND:",
      {
        creatorUid,
        videoUsername,
      }
    );

    return null;
  } catch (error) {
    console.error(
      "CREATOR LOOKUP ERROR:",
      error
    );

    return null;
  }
}

/* =====================================================
   FETCH WATCH VIDEOS
===================================================== */

export async function fetchWatchVideos() {
  try {
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

    const creatorCache: Record<
      string,
      CreatorInfo | null
    > = {};

    /* =================================================
       PROCESS VIDEOS
    ================================================= */

    for (
      const videoDoc of snapshot.docs
    ) {
      const data =
        videoDoc.data();

      /* ===============================================
         CREATOR UID
      =============================================== */

      const creatorUid =
        getString(
          data.userId
        ) ||
        getString(
          data.creatorId
        );

      /* ===============================================
         VIDEO USERNAME
      =============================================== */

      const videoUsername =
        getString(
          data.username
        );

      const videoDisplayName =
        getString(
          data.displayName
        );

      const videoPhotoURL =
        getString(
          data.photoURL
        );

      const videoPhoto =
        getString(
          data.photo
        );

      console.log(
        "PROCESSING VIDEO CREATOR:",
        {
          videoId:
            videoDoc.id,

          creatorUid,

          videoUsername,

          videoDisplayName,
        }
      );

      /* ===============================================
         CREATOR CACHE
      =============================================== */

      const cacheKey =
        creatorUid ||
        videoUsername;

      if (
        cacheKey &&
        !Object.prototype.hasOwnProperty.call(
          creatorCache,
          cacheKey
        )
      ) {
        creatorCache[cacheKey] =
          await getCreatorInfo(
            creatorUid,
            videoUsername
          );
      }

      const creator =
        cacheKey
          ? creatorCache[cacheKey]
          : null;

      /* ===============================================
         CREATOR ID
      =============================================== */

      const finalCreatorId =
        creator?.documentId ||
        creatorUid;

      /* ===============================================
         DISPLAY NAME
      =============================================== */

      let finalDisplayName =
        creator?.displayName ||
        "";

      if (
        !finalDisplayName ||
        finalDisplayName ===
          "JembeeKart User" ||
        finalDisplayName ===
          "Unknown User"
      ) {
        finalDisplayName =
          creator?.username ||
          "";
      }

      if (
        !finalDisplayName &&
        videoDisplayName &&
        videoDisplayName !==
          "JembeeKart User" &&
        videoDisplayName !==
          "Unknown User"
      ) {
        finalDisplayName =
          videoDisplayName;
      }

      if (
        !finalDisplayName &&
        videoUsername &&
        videoUsername !==
          "JembeeKart User" &&
        videoUsername !==
          "Unknown User"
      ) {
        finalDisplayName =
          videoUsername;
      }

      if (!finalDisplayName) {
        finalDisplayName =
          "Unknown User";
      }

      /* ===============================================
         USERNAME
      =============================================== */

      const finalUsername =
        creator?.username ||
        videoUsername ||
        "";

      /* ===============================================
         PHOTO
      =============================================== */

      const finalPhotoURL =
        creator?.photoURL ||
        videoPhotoURL ||
        videoPhoto ||
        "";

      /* ===============================================
         DEBUG
      =============================================== */

      console.log(
        "FINAL WATCH CREATOR:",
        {
          videoId:
            videoDoc.id,

          creatorUid,

          creatorDocumentId:
            creator?.documentId,

          finalCreatorId,

          finalDisplayName,

          finalUsername,

          finalPhotoURL,
        }
      );

      /* ===============================================
         PUSH VIDEO
      =============================================== */

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

    /* =================================================
       SUCCESS
    ================================================= */

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
