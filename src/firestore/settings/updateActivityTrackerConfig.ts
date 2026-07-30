import {
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import type {
  ActivityTrackerConfig,
} from "@/lib/admin-config/types";

/**
 * ==========================================================
 * JembeeKart
 * Update Activity Tracker Configuration
 * Production Ready
 * Firestore Driven
 * ==========================================================
 */

const COLLECTION = "settings";
const DOCUMENT = "activityTracker";

export async function updateActivityTrackerConfig(
  config: Partial<ActivityTrackerConfig>
): Promise<void> {

  const ref = doc(
    db,
    COLLECTION,
    DOCUMENT
  );

  await updateDoc(ref, {
    ...config,
    updatedAt: serverTimestamp(),
  });

}
