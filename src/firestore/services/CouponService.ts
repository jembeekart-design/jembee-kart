import { BaseFirestoreService } from "./BaseFirestoreService";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";
import { Coupon } from "@/types/adminModels";

export class CouponService extends BaseFirestoreService<Coupon> {
  constructor() {
    super(FIRESTORE_PATHS.ADMIN.COUPONS);
  }
}
