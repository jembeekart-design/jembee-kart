import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

const DEFAULT_SETTINGS = {
  global_config: { appName: "JEMBEE PLAY", appVersion: "1.0.0", environment: "production", maintenanceMode: false, supportEmail: "", website: "", createdAt: new Date().toISOString() },
  feature_flags: { shorts: true, schoolLearning: true, creatorUploads: true, videoModeration: true, paidVideo: false, livePayouts: false, videoAds: true },
  watchEarn: { enabled: false, rewardAmount: 0, videosRequired: 0, requireAdminApproval: true, autoPublish: false, allowVideoUpload: true, allowedUserRoles: ["admin", "creator"] },
  commentModeration: { blockedWords: ["abusive", "hate", "spam"], regexPatterns: [], autoReject: true, caseSensitive: false, maxLength: 500 },
  adsManager: { pageTitle: "Video Ads Manager", defaultAdRate: 0 },
  security: { twoFactor: false, loginAttempts: 5, sessionTimeout: 60 },
  version: { appVersion: "1.0.0", build: 1, releaseChannel: "production" },
};

export async function seedSystemSettings() {
  for (const [documentId, documentData] of Object.entries(DEFAULT_SETTINGS)) {
    try { const reference = doc(db, "settings", documentId); const snapshot = await getDoc(reference); await setDoc(reference, documentData, { merge: snapshot.exists() }); }
    catch (error) { console.error(`Failed to initialize settings/${documentId}`, error); }
  }
}
