import { processOrderProfit } from "./processOrderProfit";
import { distributeLevelCommission } from "./distributeLevelCommission";
import { processDeliveredOrderForRewardCycle } from "../watch-earn/processDeliveredOrderForRewardCycle";
import { checkRankUpgrade } from "../rank/checkRankUpgrade";
import { processCashback } from "./processCashback";

export async function onOrderDelivered(orderId: string, userId: string) {
  try {
    console.log(`🚀 Starting Delivery Pipeline: ${orderId}`);

    // 1. Profit Engine: Sequential execution is critical
    const profitResult = await processOrderProfit(orderId);
    
    if (!profitResult.success || profitResult.skipped) {
      return { success: true, status: "PROFIT_PROCESSING_SKIPPED_OR_FAILED", profit: false };
    }

    // 2. Financial Engines: Parallel execution for performance
    const finResults = await Promise.allSettled([
      processCashback(userId, profitResult.cashbackAmount),
      distributeLevelCommission(userId, profitResult.mlmAmount)
    ]);

    // 3. Business State Engines: Sequential execution for strict dependency integrity
    // Reward Cycle and Rank Check must run sequentially to ensure team stats are updated
    const rewardResult = await processDeliveredOrderForRewardCycle(userId);
    const rankResult = await checkRankUpgrade(userId);

    // 4. Final Pipeline Report: Accurate success tracking for all modules
    const report = {
      profit: true,
      cashback: finResults[0].status === 'fulfilled' && finResults[0].value?.success === true,
      mlm: finResults[1].status === 'fulfilled' && finResults[1].value?.success === true,
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
