import { doc, runTransaction } from "firebase/firestore";
import { db } from "@/firebase/config";
import { BaseFirestoreService } from "./BaseFirestoreService";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";
import { Order } from "@/types/adminModels";
import { distributeLevelCommission } from "@/lib/mlm/distributeLevelCommission";
import { serverTimestamp } from "firebase/firestore";

export class OrderService extends BaseFirestoreService<Order> {
  constructor() {
    super(FIRESTORE_PATHS.ADMIN.ORDERS);
  }

  async updateOrderStatus(id: string, status: string, currentOrder: Order) {
    if (status === "delivered" && currentOrder.userId) {
      await runTransaction(db, async (transaction) => {
        const orderRef = doc(db, this.collectionPath, id);
        const userProfileRef = doc(db, "users", currentOrder.userId);
        const userSnap = await transaction.get(userProfileRef);
        
        if (userSnap.exists()) {
          // STEP 1: Delivered → MLM profile state activation tracking
          transaction.update(userProfileRef, {
            joinedPackage: true,
            mlmActive: true,
            packageStatus: "active",
            activationDate: serverTimestamp(),
          });

          console.log(`MLM parameters initialized for User ID: ${currentOrder.userId}`);

          // ✅ STEP 2: Trigger Multi-level Commission Engine calculations
          // Mapping amount to profitAmount as per original logic
          await distributeLevelCommission({
            userId: currentOrder.userId,
            profitAmount: currentOrder.profitAmount || currentOrder.amount,
            orderId: currentOrder.id,
            orderStatus: "delivered",
          });

          console.log(`Up-line level distribution sequence dispatched for order trace context: ${id}`);

          // ✅ STEP 3: Single write transaction lock pipeline settlement
          transaction.update(orderRef, { 
            status, 
            commissionProcessed: true 
          });

          console.log(`Financial settlement locks and status committed atomically for Order ID: ${id}`);
        } else {
          console.warn("User profile path missing from Firestore trees.");
        }
      });
    } else {
      await this.update(id, { status });
    }
  }
}
