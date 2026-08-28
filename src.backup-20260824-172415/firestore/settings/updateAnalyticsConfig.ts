import {
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import type {
  AnalyticsConfig,
} from "@/lib/admin-config/types";

const COLLECTION = "settings";
const DOCUMENT = "analytics";

export async function updateAnalyticsConfig(
  config: Partial<AnalyticsConfig>
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
