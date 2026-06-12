import { processOrderProfit } from "./processOrderProfit";
import { distributeLevelCommission } from "./distributeLevelCommission";
import { processCashback } from "./processCashback";
import { processDeliveredOrderForRewardCycle } from "../watch-earn/processDeliveredOrderForRewardCycle";
import { checkRankUpgrade } from "../rank/checkRankUpgrade";

export async function onOrderDelivered(orderId: string, userId: string) {
  try {
    console.log(`🚀 Starting Delivery Pipeline: ${orderId}`);

    const profitResult = await processOrderProfit(orderId);
    
    if (!profitResult.success || profitResult.skipped) {
      return { success: true, status: "PROFIT_PROCESSING_SKIPPED_OR_FAILED", profit: false };
    }

    // FIX: Using exact property names (cashbackAmount & mlmAmount)
    const finResults = await Promise.allSettled([
      processCashback(userId, profitResult.cashbackAmount),
      distributeLevelCommission({
        userId: userId,
        profitAmount: profitResult.mlmAmount, // FIX: Used mlmAmount
        orderId: orderId,
        orderStatus: "delivered"
      })
    ]);

    const rewardResult = await processDeliveredOrderForRewardCycle(userId);
    const rankResult = await checkRankUpgrade(userId);

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
