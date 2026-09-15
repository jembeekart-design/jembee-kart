import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

import { db, auth } from "@/firebase/config";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";

interface ReportVideoData {
  videoId: string;
  reason: string;
  message?: string;
}

export async function reportVideo(data: ReportVideoData) {
  try {
    // 1. Secure identity verification
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, message: "Authentication required" };
    }
    
    const authenticatedUserId = currentUser.uid;

    // 2. Deterministic ID for idempotency (prevent duplicate reports by same user for same video)
    const reportId = `${data.videoId}_${authenticatedUserId}`;
    const reportRef = doc(db, FIRESTORE_PATHS.WATCH_EARN.VIDEO_REPORTS, reportId);

    // 3. Check if already reported
    const reportSnap = await getDoc(reportRef);
    if (reportSnap.exists()) {
      return { success: false, message: "Already reported" };
    }

    // 4. Create report document
    await setDoc(reportRef, {
      userId: authenticatedUserId,
      videoId: data.videoId,
      reason: data.reason,
      message: data.message || "",
      status: "pending",
      createdAt: serverTimestamp() // Convention: using serverTimestamp
    });

    return { success: true };
  } catch (error) {
    console.error("REPORT VIDEO ERROR:", error);
    return { success: false, message: "An error occurred" };
  }
}
