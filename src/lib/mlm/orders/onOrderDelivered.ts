import { processOrderProfit } from "./processOrderProfit";
// Sabhi files 'orders' folder mein hi hain, isliye ./ use karenge
import { distributeLevelCommission } from "./distributeLevelCommission";
import { processCashback } from "./processCashback";
import { processDeliveredOrderForRewardCycle } from "./processDeliveredOrderForRewardCycle";
import { checkRankUpgrade } from "./checkRankUpgrade";

// Interface for type safety
interface ProfitResult {
  success: boolean;
  skipped?: boolean;
  cashbackAmount: number;
  mlmAmount: number;
  rewardPoolAmount: number;
  userId: string;
  [key: string]: any;
}

/**
 * Master Delivery Pipeline - v5.0
 * Direct Folder Reference Implementation
 */
export async function onOrderDelivered(orderId: string, userId: string) {
  try {
    console.log(`🚀 Starting Delivery Pipeline: ${orderId}`);

    // 1. Profit Engine
    const profitResult = (await processOrderProfit(orderId)) as ProfitResult;
    
    if (!profitResult.success || profitResult.skipped) {
      return { success: true, status: "PROFIT_PROCESSING_SKIPPED", profit: false };
    }

    // 2. Financial Engines
    const finResults = await Promise.allSettled([
      processCashback(userId, profitResult.cashbackAmount),
      distributeLevelCommission({
        userId: userId,
        profitAmount: profitResult.mlmAmount,
        orderId: orderId,
        orderStatus: "delivered"
      })
    ]);

    // 3. Business State Engines
    const rewardResult = await processDeliveredOrderForRewardCycle(userId);
    const rankResult = await checkRankUpgrade(userId);

    // 4. Final Report
    const report = {
      profit: true,
      cashback: finResults[0].status === 'fulfilled' && (finResults[0].value as any)?.success === true,
      mlm: finResults[1].status === 'fulfilled' && (finResults[1].value as any)?.success === true,
      reward: rewardResult?.success === true,
      rank: rankResult?.success === true
    };

    console.log(`✅ Pipeline Complete: ${orderId}`, report);
    return { success: true, report };
    
  } catch (error: any) {
    console.error("PIPELINE_CRITICAL_FAILURE:", error.message);
    return { success: false, error: error.message };
  }
}
