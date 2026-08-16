import { BaseFirestoreService } from "./BaseFirestoreService";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";
import { AIBannerDraft } from "@/types/aiBanner";

export class AIBannerService extends BaseFirestoreService<AIBannerDraft> {
  constructor() {
    super(FIRESTORE_PATHS.ADMIN.DRAFTS);
  }

  // Add module-specific methods here if needed
}
