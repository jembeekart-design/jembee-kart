import { processOrderProfit } from "./processOrderProfit";
// Absolute paths se import kar rahe hain taaki file structure se farak na pade
import { distributeLevelCommission } from "@/lib/mlm/distributeLevelCommission";
import { processCashback } from "@/lib/mlm/processCashback";
import { processDeliveredOrderForRewardCycle } from "@/lib/mlm/watch-earn/processDeliveredOrderForRewardCycle";
import { checkRankUpgrade } from "@/lib/mlm/orders/checkRankUpgrade";

interface ProfitResult {
  success: boolean;
  skipped?: boolean;
  cashbackAmount: number;
  mlmAmount: number;
  rewardPoolAmount: number;
  userId: string;
  [key: string]: any;
}

export async function onOrderDelivered(orderId: string, userId: string) {
  try {
    const profitResult = (await processOrderProfit(orderId)) as ProfitResult;
    
    if (!profitResult.success || profitResult.skipped) {
      return { success: true, status: "PROFIT_PROCESSING_SKIPPED", profit: false };
    }

    // Parallel execution for financial logic
    const finResults = await Promise.allSettled([
      processCashback(userId, profitResult.cashbackAmount),
      distributeLevelCommission({
        userId: userId,
        profitAmount: profitResult.mlmAmount,
        orderId: orderId,
        orderStatus: "delivered"
      })
    ]);

    // Sequential execution for system state
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
    console.error("PIPELINE_CRITICAL_FAILURE:", error.message);
    return { success: false, error: error.message };
  }
}
