import {
  collection,
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  increment,
  getDocs,
  limit,
  addDoc
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";
import { DEFAULT_ADMIN_CONFIG } from "@/lib/admin-config/defaults";

const FLOATING_ADS_COLLECTION = FIRESTORE_PATHS.WATCH_EARN.FLOATING_ADS;
const STATS_COLLECTION = FIRESTORE_PATHS.WATCH_EARN.STATS;

export async function initializeFloatingAds() {
  const adsCollection = collection(db, FLOATING_ADS_COLLECTION);
  const snapshot = await getDocs(query(adsCollection, limit(1)));
  if (snapshot.empty) {
    await addDoc(adsCollection, {
      enabled: true,
      title: "Special Offer",
      imageUrl: "",
      actionUrl: "",
      skipAfterSeconds: 3,
      autoHide: false,
      position: "right",
      priority: 1,
      createdAt: serverTimestamp(),
    });
  }
}

export async function getFloatingAds(callback: (ads: any[]) => void) {
  const q = query(collection(db, FLOATING_ADS_COLLECTION), where("enabled", "==", true));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
}

export async function getWatchStats(userId: string, callback: (stats: any) => void) {
  const statsRef = doc(db, STATS_COLLECTION, userId);
  return onSnapshot(statsRef, (docSnap) => {
    callback(docSnap.exists() ? docSnap.data() : DEFAULT_ADMIN_CONFIG.watchEarnStats);
  });
}
// ... (rest of file)

export async function updateWatchStats(userId: string, coinsEarned: number) {
  const statsRef = doc(db, STATS_COLLECTION, userId);
  await updateDoc(statsRef, {
    totalCoins: increment(coinsEarned),
    videosWatched: increment(1),
    updatedAt: serverTimestamp(),
  });
}
