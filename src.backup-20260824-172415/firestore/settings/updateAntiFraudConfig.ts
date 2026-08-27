import {
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import type {
  AntiFraudConfig,
} from "@/modules/anti-fraud";

/**
 * ==========================================================
 * JembeeKart
 * Update Anti Fraud Configuration
 * Production Ready
 * Firestore Driven
 * ==========================================================
 */

const COLLECTION = "admin_settings";
const DOCUMENT = "antiFraud";

export async function updateAntiFraudConfig(
  config: Partial<AntiFraudConfig>
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
