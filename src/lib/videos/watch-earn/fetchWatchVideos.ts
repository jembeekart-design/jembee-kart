import {
  collection,
  getDocs,
  getDoc,
  doc,
  limit,
  orderBy,
  query,
  where,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export interface WatchVideo {
  id: string;
  creatorId: string; // Will be empty string if creator not found
  username: string;
  displayName?: string;
  photoURL?: string;
  caption: string;
  hashtags: string[];
  music: string;
  verified: boolean;
  video: string;
  thumbnail?: string;
  coins: number;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  originalVideoId?: string;
  originalAudioId?: string;
  sponsor?: boolean;
  createdAt?: number;
  videoAccess?: "free" | "paid";
  videoPrice?: number;
  videoFormat?: "short" | "long";
  durationSeconds?: number;
}

export interface CreatorInfo {
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
    displayName !== "JEMBEE PLAY User" &&
    displayName !== "Unknown User"
  ) {
    return displayName;
  }

  if (
    name &&
    name !== "JEMBEE PLAY User" &&
    name !== "Unknown User"
  ) {
    return name;
  }

  if (fullName) {
    return fullName;
  }

  if (
    username &&
    username !== "JEMBEE PLAY User" &&
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

export async function getCreatorInfo(
  videoId: string,
  creatorUid: string,
  videoUsername: string
): Promise<CreatorInfo | null> {
  if (!videoId) return null;

  try {
    const response = await fetch(
      `/api/creator/public-profile?videoId=${encodeURIComponent(videoId)}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!response.ok) return null;

    const result: unknown = await response.json();

    if (
      !result ||
      typeof result !== "object" ||
      !("success" in result) ||
      result.success !== true ||
      !("creator" in result) ||
      !result.creator ||
      typeof result.creator !== "object"
    ) {
      return null;
    }

    const creator = result.creator as Record<string, unknown>;

    return {
      documentId:
        getString(creator.documentId) || creatorUid,
      displayName:
        getString(creator.displayName) || undefined,
      username:
        getString(creator.username) || videoUsername || undefined,
      photoURL:
        getString(creator.photoURL) || undefined,
    };
  } catch (error) {
    console.warn("[PublicCreatorProfile] Client lookup failed:", error);
    return null;
  }
}

/* =====================================================
   SHARED PROCESSING LOGIC
===================================================== */

async function processVideoDoc(
  videoDoc: QueryDocumentSnapshot<DocumentData>,
  creatorCache: Record<string, CreatorInfo | null>
): Promise<WatchVideo> {
  const data = videoDoc.data();

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
        videoDoc.id,
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
    creatorUid ||
    creator?.documentId ||
    "";

  /* ===============================================
     DISPLAY NAME
  =============================================== */

  let finalDisplayName =
    creator?.displayName ||
    "";

  if (
    !finalDisplayName ||
    finalDisplayName ===
      "JEMBEE PLAY User" ||
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
      "JEMBEE PLAY User" &&
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
      "JEMBEE PLAY User" &&
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

  return {
    id: videoDoc.id,

    creatorId: finalCreatorId,

    username: finalUsername,

    displayName: finalDisplayName,

    photoURL: finalPhotoURL,

    caption: getString(data.caption),

    hashtags: Array.isArray(data.hashtags)
      ? data.hashtags.filter(
          (tag): tag is string => typeof tag === "string"
        )
      : [],

    music: getString(data.music),

    verified: data.verified === true,

    video: getString(data.video),

    thumbnail: getString(data.thumbnail),


    coins: typeof data.coins === "number" ? data.coins : 0,

    likes: typeof data.likes === "number" ? data.likes : 0,

    comments: typeof data.comments === "number" ? data.comments : 0,

    shares: typeof data.shares === "number" ? data.shares : 0,

    views: typeof data.views === "number" ? data.views : 0,

    originalVideoId: getString(data.originalVideoId) || undefined,

    originalAudioId: getString(data.originalAudioId) || undefined,

    sponsor: data.sponsor === true,

    videoAccess: data.videoAccess === "paid" || data.videoAccess === "free"
      ? data.videoAccess
      : undefined,
    videoPrice: typeof data.videoPrice === "number" ? data.videoPrice : undefined,
    // Legacy uploads came through the Shorts-only upload flow. New uploads store this explicitly.
    videoFormat: data.videoFormat === "long" ? "long" : "short",
    durationSeconds: typeof data.durationSeconds === "number" && Number.isFinite(data.durationSeconds) && data.durationSeconds > 0 ? data.durationSeconds : undefined,

    createdAt: typeof data.createdAt === "number" ? data.createdAt : 0,
  };
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
        where("status", "==", "approved"),
        where("active", "==", true),
        where("moderation", "==", "safe"),
        where("videoAccess", "==", "free"),
        orderBy("createdAt", "desc"),
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
      videos.push(await processVideoDoc(videoDoc, creatorCache));
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

/* =====================================================
   FETCH CREATOR VIDEOS
===================================================== */

export async function fetchCreatorVideos(creatorId: string) {
  try {
    console.log("[DEBUG] fetchCreatorVideos - Querying for creatorId:", creatorId);
    const videosRef = collection(db, "watchEarnVideos");

    const q1 = query(videosRef, where("userId", "==", creatorId));
    const q2 = query(videosRef, where("creatorId", "==", creatorId));

    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

    console.log("[DEBUG] fetchCreatorVideos - q1 count:", snap1.size);
    console.log("[DEBUG] fetchCreatorVideos - q2 count:", snap2.size);

    snap1.docs.slice(0, 3).forEach((d, i) => console.log(`[DEBUG] fetchCreatorVideos - q1 doc ${i} userId:`, d.data().userId, "creatorId:", d.data().creatorId));
    snap2.docs.slice(0, 3).forEach((d, i) => console.log(`[DEBUG] fetchCreatorVideos - q2 doc ${i} userId:`, d.data().userId, "creatorId:", d.data().creatorId));

    const docs = [...snap1.docs, ...snap2.docs];
    // Deduplicate
    const uniqueDocs = Array.from(new Map(docs.map(item => [item.id, item])).values());

    const videos: WatchVideo[] = [];
    const creatorCache: Record<string, CreatorInfo | null> = {};
    for (const doc of uniqueDocs) {
      videos.push(await processVideoDoc(doc, creatorCache));
    }

    return { success: true, videos };
  } catch (error) {
    console.error("FETCH CREATOR VIDEOS ERROR:", error);
    return { success: false, videos: [] };
  }
}
