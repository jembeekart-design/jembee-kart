import { processOrderProfit } from "./processOrderProfit";
// Using Absolute Paths (@/lib/mlm/...) to bypass TS2307 Module Resolution Errors
import { distributeLevelCommission } from "@/lib/mlm/distributeLevelCommission";
import { processCashback } from "@/lib/mlm/processCashback";
import { processDeliveredOrderForRewardCycle } from "@/lib/mlm/watch-earn/processDeliveredOrderForRewardCycle";
import { checkRankUpgrade } from "@/lib/mlm/rank/checkRankUpgrade";

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
 * Master Delivery Pipeline - v4.0
 * Absolute Path Imports Implemented
 */
export async function onOrderDelivered(orderId: string, userId: string) {
  try {
    console.log(`🚀 Starting Delivery Pipeline: ${orderId}`);

    // Profit Engine Execution
    const profitResult = (await processOrderProfit(orderId)) as ProfitResult;
    
    // Check processing success
    if (!profitResult.success || profitResult.skipped) {
      return { success: true, status: "PROFIT_PROCESSING_SKIPPED_OR_FAILED", profit: false };
    }

    // Financial Engines: Parallel processing with typed properties
    const finResults = await Promise.allSettled([
      processCashback(userId, profitResult.cashbackAmount),
      distributeLevelCommission({
        userId: userId,
        profitAmount: profitResult.mlmAmount,
        orderId: orderId,
        orderStatus: "delivered"
      })
    ]);

    // Business Logic Engines: Sequential processing
    const rewardResult = await processDeliveredOrderForRewardCycle(userId);
    const rankResult = await checkRankUpgrade(userId);

    // Final Report Assembly
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
