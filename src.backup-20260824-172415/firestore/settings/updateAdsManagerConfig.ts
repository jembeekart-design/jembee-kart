import {
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import type {
  AdsManagerConfig,
} from "@/lib/admin-config/types";

const COLLECTION = "settings";
const DOCUMENT = "adsManager";

export async function updateAdsManagerConfig(
  config: Partial<AdsManagerConfig>
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
