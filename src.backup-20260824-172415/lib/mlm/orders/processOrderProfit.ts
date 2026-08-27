import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { MLM_CONFIG, ENGINE_VERSION } from "@/lib/mlm/config";

export async function processOrderProfit(orderId: string) {
  try {
    return await runTransaction(db, async (transaction) => {
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await transaction.get(orderRef);

      if (!orderSnap.exists()) throw new Error("ORDER_NOT_FOUND");
      const order = orderSnap.data();

      if (order.profitProcessed) throw new Error("PROFIT_ALREADY_PROCESSED");
      if (order.status !== "DELIVERED") throw new Error("ORDER_NOT_DELIVERED");

      const netProfit = order.sellingPrice - order.productCost - order.shippingCost - order.platformFee;
      const toCurrency = (val: number) => Number(val.toFixed(2));

      // 1. Config & Validation
      const cashbackPercent = MLM_CONFIG.cashbackPercent ?? 0.05;
      const mlmPercent = MLM_CONFIG.mlmPercent ?? 0.10;
      const rewardPercent = MLM_CONFIG.rewardPoolPercent ?? 0.05;

      if (cashbackPercent + mlmPercent + rewardPercent > 1) {
        throw new Error("INVALID_DISTRIBUTION_CONFIG");
      }

      // 2. Profit Processing
      if (netProfit <= 0) {
        transaction.update(orderRef, {
          netProfit: toCurrency(netProfit),
          companyProfit: toCurrency(netProfit),
          engineVersion: ENGINE_VERSION,
          profitProcessed: true,
          profitProcessedAt: serverTimestamp(),
        });
        return { success: true, skipped: true, userId: order.userId };
      }

      // 3. Distribution Calculation
      const dist = {
        cashbackAmount: toCurrency(netProfit * cashbackPercent),
        mlmAmount: toCurrency(netProfit * mlmPercent),
        rewardPoolAmount: toCurrency(netProfit * rewardPercent),
      };

      const companyProfit = toCurrency(netProfit - (dist.cashbackAmount + dist.mlmAmount + dist.rewardPoolAmount));

      // 4. Atomic Update
      transaction.update(orderRef, {
        netProfit: toCurrency(netProfit),
        ...dist,
        companyProfit,
        engineVersion: ENGINE_VERSION,
        profitProcessed: true,
        profitProcessedAt: serverTimestamp()
      });

      return { 
        success: true, 
        userId: order.userId, 
        netProfit: toCurrency(netProfit), 
        ...dist 
      };
    });
  } catch (error: any) {
    console.error("PROFIT_ENGINE_FAILED:", error.message);
    throw new Error(`PROFIT_PROCESSING_FAILED: ${error.message}`);
  }
}
