import { BaseFirestoreService } from "./BaseFirestoreService";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";
import { KYCRequest } from "@/types/adminModels";

export class KYCService extends BaseFirestoreService<KYCRequest> {
  constructor() {
    super(FIRESTORE_PATHS.ADMIN.KYC_REQUESTS);
  }

  async updateKYCStatus(id: string, status: string) {
    await this.update(id, { status });
  }
}
