import {
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import type {
  Theme,
} from "@/types/theme";

/**
 * ==========================================================
 * JembeeKart
 * Update Theme Configuration
 * Production Ready
 * Firestore Driven
 * ==========================================================
 */

const COLLECTION = "admin_settings";
const DOCUMENT = "customize";

export async function updateThemeConfig(
  config: Partial<Theme>
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
