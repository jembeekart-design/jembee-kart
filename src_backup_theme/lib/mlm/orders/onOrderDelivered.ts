import { processOrderProfit } from "./processOrderProfit";
import { checkRankUpgrade } from "./checkRankUpgrade";

// Sabhi modules ka standard Absolute Path implementation
import { distributeLevelCommission } from "@/lib/mlm/distributeLevelCommission";
import { processCashback } from "@/lib/mlm/financial/processCashback"; 
import { processDeliveredOrderForRewardCycle } from "@/lib/mlm/watch-earn/processDeliveredOrderForRewardCycle";

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
 * Master Delivery Pipeline - Production Ready
 * Handles profit, commission, cashback, rewards, and rank upgrades
 */
export async function onOrderDelivered(orderId: string, userId: string) {
  try {
    console.log(`🚀 Starting Delivery Pipeline: ${orderId} for User: ${userId}`);

    // 1. Profit Calculation
    const profitResult = (await processOrderProfit(orderId)) as ProfitResult;
    
    if (!profitResult.success || profitResult.skipped) {
      return { success: true, status: "PROFIT_PROCESSING_SKIPPED", profit: false };
    }

    // 2. Parallel Financial Processing (Cashback & Commission)
    const finResults = await Promise.allSettled([
      processCashback(userId, profitResult.cashbackAmount),
      distributeLevelCommission({
        userId: userId,
        profitAmount: profitResult.mlmAmount,
        orderId: orderId,
        orderStatus: "delivered"
      })
    ]);

    // 3. System State Updates (Sequential for consistency)
    const rewardResult = await processDeliveredOrderForRewardCycle(userId);
    const rankResult = await checkRankUpgrade(userId);

    // 4. Report Generation
    const report = {
      profit: true,
      cashback: finResults[0].status === 'fulfilled' && (finResults[0].value as any)?.success === true,
      mlm: finResults[1].status === 'fulfilled' && (finResults[1].value as any)?.success === true,
      reward: rewardResult?.success === true,
      rank: rankResult?.success === true
    };

    console.log(`✅ Pipeline Successful:`, report);
    return { success: true, report };
    
  } catch (error: any) {
    console.error("❌ PIPELINE_CRITICAL_FAILURE:", error.message);
    return { success: false, error: error.message };
  }
}
