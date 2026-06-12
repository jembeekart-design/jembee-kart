import { processOrderProfit } from "./processOrderProfit";
import { distributeLevelCommission } from "./distributeLevelCommission";
import { processDeliveredOrderForRewardCycle } from "../watch-earn/processDeliveredOrderForRewardCycle";
import { checkRankUpgrade } from "../rank/checkRankUpgrade";
import { processCashback } from "./processCashback";

/**
 * Master Delivery Pipeline - v4.0 (Interface Compatible)
 */
export async function onOrderDelivered(orderId: string, userId: string) {
  try {
    console.log(`🚀 Starting Delivery Pipeline: ${orderId}`);

    // 1. Profit Engine
    const profitResult = await processOrderProfit(orderId);
    
    if (!profitResult.success || profitResult.skipped) {
      return { success: true, status: "PROFIT_PROCESSING_SKIPPED_OR_FAILED", profit: false };
    }

    // 2. Financial Engines: Parallel execution
    // FIX: Using object syntax to match DistributeLevelCommissionData interface (from 1000325810.jpg)
    const finResults = await Promise.allSettled([
      processCashback(userId, profitResult.cashbackAmount),
      distributeLevelCommission({
        userId: userId,
        profitAmount: profitResult.mlmAmount,
        orderId: orderId,
        orderStatus: "delivered"
      })
    ]);

    // 3. Business State Engines: Sequential execution
    const rewardResult = await processDeliveredOrderForRewardCycle(userId);
    const rankResult = await checkRankUpgrade(userId);

    // 4. Final Pipeline Report
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
