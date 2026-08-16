import { BaseFirestoreService } from "./BaseFirestoreService";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";
import { Banner } from "@/types/adminModels";

export class BannerService extends BaseFirestoreService<Banner> {
  constructor() {
    super(FIRESTORE_PATHS.UI_LAYOUT.BANNERS);
  }
}
