import { processOrderProfit } from "./processOrderProfit";
// Ensure this path is correct. If it's in the same folder, this is fine.
import { distributeLevelCommission } from "./distributeLevelCommission"; 
import { processCashback } from "./processCashback";
import { processDeliveredOrderForRewardCycle } from "../watch-earn/processDeliveredOrderForRewardCycle";
import { checkRankUpgrade } from "../rank/checkRankUpgrade";

export async function onOrderDelivered(orderId: string, userId: string) {
  try {
    console.log(`🚀 Starting Delivery Pipeline: ${orderId}`);

    const profitResult = await processOrderProfit(orderId);
    
    // FIX: Match properties with what processOrderProfit actually returns
    if (!profitResult.success || profitResult.skipped) {
      return { success: true, status: "PROFIT_PROCESSING_SKIPPED_OR_FAILED", profit: false };
    }

    // FIX: Using profitResult.cashback and profitResult.mlm (if that's what your function returns)
    const finResults = await Promise.allSettled([
      processCashback(userId, profitResult.cashback), 
      distributeLevelCommission({
        userId: userId,
        profitAmount: profitResult.mlm, // FIX: Mapped to mlm instead of mlmAmount
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

    return { success: true, report };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
