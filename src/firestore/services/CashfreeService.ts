import { BaseFirestoreService } from "./BaseFirestoreService";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";
import { CashfreeSettings } from "@/types/cashfreeModels";

export class CashfreeService extends BaseFirestoreService<CashfreeSettings> {
  private readonly docId = "cashfree";

  constructor() {
    super(FIRESTORE_PATHS.ADMIN.CASHFREE);
  }

  async getSettings(): Promise<CashfreeSettings | null> {
    const data = await this.getById(this.docId);
    return data ? (data as CashfreeSettings) : null;
  }

  async saveSettings(settings: CashfreeSettings): Promise<void> {
    await this.create(this.docId, settings);
  }
}
