import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import type {
  AntiFraudConfig,
} from "@/modules/anti-fraud";

const COLLECTION = "admin_settings";
const DOCUMENT = "antiFraud";

/**
 * ==========================================================
 * Get Anti Fraud Config
 * ==========================================================
 */

export async function getAntiFraudConfig(): Promise<AntiFraudConfig> {

  const ref = doc(
    db,
    COLLECTION,
    DOCUMENT
  );

  const snap = await getDoc(ref);

  if (!snap.exists()) {

    throw new Error(
      "Anti Fraud Config Not Found"
    );

  }

  return snap.data() as AntiFraudConfig;

}

/**
 * ==========================================================
 * Save Anti Fraud Config
 * ==========================================================
 */

export async function saveAntiFraudConfig(
  config: AntiFraudConfig
): Promise<void> {

  const ref = doc(
    db,
    COLLECTION,
    DOCUMENT
  );

  await setDoc(
    ref,
    {
      ...config,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );

}

/**
 * ==========================================================
 * Create Default Config
 * ==========================================================
 */

export async function createDefaultAntiFraudConfig(): Promise<void> {

  const ref = doc(
    db,
    COLLECTION,
    DOCUMENT
  );

  const snap = await getDoc(ref);

  if (snap.exists()) return;

  await setDoc(ref, {

    enabled: true,

    selfReferralProtection: true,

    withdrawalFraudProtection: true,

    watchFarmingProtection: true,

    checkMobile: true,

    checkEmail: true,

    checkDevice: true,

    checkIP: true,

    checkKYC: true,

    checkPAN: true,

    checkAadhaar: true,

    blockCommission: true,

    autoSuspend: false,

    logViolation: true,

    configVersion: 1,

    createdAt: serverTimestamp(),

    updatedAt: serverTimestamp(),

  });

}
