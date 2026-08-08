import {
  collection,
  getDocs,
  getDoc,
  doc,
  limit,
  orderBy,
  query
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
    const creatorCache: Record<string, { displayName?: string, photoURL?: string }> = {};
for (const docItem of snapshot.docs) {
  const data = docItem.data();
  const creatorId = data.creatorId || "";

  console.log("DEBUG: Processing video", docItem.id, "creatorId:", creatorId);

  let displayName = data.displayName;
  let photoURL = data.photoURL;

  // Force fetch user data if not in cache, even if displayName/photoURL exist, to ensure we get the latest data
  if (creatorId && !creatorCache[creatorId]) {
    const userRef = doc(db, "users", creatorId);
    const userSnap = await getDoc(userRef);
    console.log("DEBUG: Fetched user document for", creatorId, ":", userSnap.exists() ? userSnap.data() : "not found");

    if (userSnap.exists()) {
      const userData = userSnap.data();
      creatorCache[creatorId] = {
        displayName: userData.displayName || userData.name || (userData.firstName ? userData.firstName + ' ' + userData.lastName : undefined),
        photoURL: userData.photoURL
      };
    } else {
      creatorCache[creatorId] = { displayName: undefined, photoURL: undefined };
    }
  }

  // Priority: Creator document (from cache) > Video document
  const finalDisplayName = creatorCache[creatorId]?.displayName || displayName;
  const finalPhotoURL = creatorCache[creatorId]?.photoURL || photoURL;

  console.log("DEBUG: Final displayName:", finalDisplayName, "finalPhotoURL:", finalPhotoURL);

  videos.push({
    id: docItem.id,
    creatorId: creatorId,
    username: data.username || "",
    displayName: finalDisplayName,
    photoURL: finalPhotoURL,
    caption: data.caption || "",
//...

        hashtags: data.hashtags || [],
        music: data.music || "",
        verified: data.verified || false,
        video: data.video || "",
        thumbnail: data.thumbnail || "",
        productId: data.productId || "",
        coins: data.coins || 0,
        likes: data.likes || 0,
        comments: data.comments || 0,
        shares: data.shares || 0,
        views: data.views || 0,
        originalVideoId: data.originalVideoId || undefined,
        originalAudioId: data.originalAudioId || undefined,
        sponsor: data.sponsor || false,
        createdAt: data.createdAt || 0
      });
    }

    return {
      success: true,
      videos
    };
  } catch (error) {
    console.error("FETCH WATCH VIDEOS ERROR:", error);
    return {
      success: false,
      videos: []
    };
  }
}
