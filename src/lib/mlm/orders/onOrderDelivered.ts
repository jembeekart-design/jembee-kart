import { processOrderProfit } from "./processOrderProfit";
// Import paths fix kar diye hain taaki 'orders' folder se bahar nikal kar file mil sake
import { distributeLevelCommission } from "../distributeLevelCommission";
import { processCashback } from "../processCashback";
import { processDeliveredOrderForRewardCycle } from "../watch-earn/processDeliveredOrderForRewardCycle";
import { checkRankUpgrade } from "../rank/checkRankUpgrade";

// TypeScript error se bachne ke liye strict interface
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
 * JembeeKart Production-Ready Architecture
 */
export async function onOrderDelivered(orderId: string, userId: string) {
  try {
    console.log(`🚀 Starting Delivery Pipeline: ${orderId}`);

    // 1. Profit Engine: Casting result to ProfitResult interface
    const profitResult = (await processOrderProfit(orderId)) as ProfitResult;
    
    // Check if profit processing was successful and not skipped
    if (!profitResult.success || profitResult.skipped) {
      return { success: true, status: "PROFIT_PROCESSING_SKIPPED", profit: false };
    }

    // 2. Financial Engines: Parallel execution using corrected properties
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
