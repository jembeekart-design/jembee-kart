import {
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import type {
  AnnouncementConfig,
} from "@/lib/admin-config/types";

const COLLECTION = "settings";
const DOCUMENT = "announcement";

export async function updateAnnouncementConfig(
  config: Partial<AnnouncementConfig>
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
