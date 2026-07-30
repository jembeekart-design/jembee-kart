import {
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import type {
  AdminChatConfig,
} from "@/lib/admin-config/types";

const COLLECTION = "settings";
const DOCUMENT = "adminChat";

export async function updateAdminChatConfig(
  config: Partial<AdminChatConfig>
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
