import { processOrderProfit } from "./processOrderProfit";

// Absolute path strategy: src folder se direct access
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

    // Using absolute paths above ensures we look in the src root
    const finResults = await Promise.allSettled([
      processCashback(userId, profitResult.cashbackAmount),
      distributeLevelCommission({
        userId: userId,
        profitAmount: profitResult.mlmAmount,
        orderId: orderId,
        orderStatus: "delivered"
      })
    ]);

    const rewardResult = await processDeliveredOrderForRewardCycle(userId);
    const rankResult = await checkRankUpgrade(userId);

    return { success: true, report: { profit: true } };
    
  } catch (error: any) {
    console.error("PIPELINE_CRITICAL_FAILURE:", error.message);
    return { success: false, error: error.message };
  }
}
