import {
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import type {
  AntiFraudConfig,
} from "../types/antiFraud.types";

/**
 * ==========================================================
 * JembeeKart
 * Load Anti Fraud Configuration
 * Firestore Driven
 * No Hardcoded Business Logic
 * ==========================================================
 */

export async function loadAntiFraudConfig(): Promise<AntiFraudConfig> {

  const snapshot = await getDoc(
    doc(
      db,
      "admin_settings",
      "antiFraud"
    )
  );

  if (!snapshot.exists()) {

    throw new Error(
      "Anti Fraud configuration not found."
    );

  }

  return snapshot.data() as AntiFraudConfig;

}
