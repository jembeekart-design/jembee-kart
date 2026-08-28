import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

const COLLECTION = "systemIntegrations";

export interface IntegrationStatus {
  integrated: boolean;
  integratedAt: string;
  integratedBy: string;
}

export async function getIntegrationStatus(
  module: string
): Promise<IntegrationStatus | null> {

  const snapshot = await getDoc(
    doc(db, COLLECTION, module)
  );

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as IntegrationStatus;
}

export async function saveIntegrationStatus(
  module: string,
  admin = "Admin"
): Promise<void> {

  await setDoc(
    doc(db, COLLECTION, module),
    {
      integrated: true,
      integratedAt: new Date().toISOString(),
      integratedBy: admin,
    },
    {
      merge: true,
    }
  );

}
