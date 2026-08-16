import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";
import { HomepageSettings } from "@/types/adminModels";

export class HomepageService {
  private docRef = doc(db, FIRESTORE_PATHS.ADMIN.HOMEPAGE, "homepage");

  async getSettings(): Promise<HomepageSettings | null> {
    const snap = await getDoc(this.docRef);
    return snap.exists() ? (snap.data() as HomepageSettings) : null;
  }

  async saveSettings(settings: HomepageSettings): Promise<void> {
    await setDoc(this.docRef, settings);
  }
}
