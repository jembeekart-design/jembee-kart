import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import DEFAULT_ADMIN_CONFIG from "./defaults";

export async function initializeAdminConfig() {
  const globalRef = doc(db, "settings", "global_config");

  const globalSnap = await getDoc(globalRef);

  if (!globalSnap.exists()) {
    await setDoc(globalRef, DEFAULT_ADMIN_CONFIG);
  }
}
