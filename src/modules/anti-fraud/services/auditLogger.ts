import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import type {
  FraudAuditLog,
} from "../types/antiFraud.types";

/**
 * ==========================================================
 * JembeeKart
 * Anti Fraud Audit Logger
 * Production Ready
 * Firestore Driven
 * ==========================================================
 */

const COLLECTION_NAME = "antiFraudAuditLogs";

export async function logFraudViolation(
  log: FraudAuditLog
): Promise<void> {

  await addDoc(
    collection(
      db,
      COLLECTION_NAME
    ),
    {
      ...log,
      createdAt: serverTimestamp(),
    }
  );

}
