/**
 * Daily passive income is a scheduled financial payout, not a client claim.
 * The former client Firestore implementation accepted a caller-controlled amount
 * and wrote wallet balances directly. It is intentionally disabled until the
 * trusted scheduler/admin payout flow supplies a server-calculated amount.
 */
interface CreateDailyPassiveIncomeData {
  userId: string;
  amount: number;
}

export async function createDailyPassiveIncome(_data: CreateDailyPassiveIncomeData) {
  return {
    success: false,
    message: "Client-side passive income payouts are disabled. Use the trusted server payout workflow.",
  };
}
