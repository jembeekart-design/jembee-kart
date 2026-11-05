/**
 * Legacy client-side payout intentionally disabled.
 * Client input is not authoritative for reward eligibility or amount.
 * Re-enable only after a server endpoint verifies the underlying event and
 * credits the wallet and ledger atomically with a deterministic idempotency key.
 */
interface CreateReferralVisitRewardData {
  userId: string;
  visitorId: string;
  rewardAmount: number;
}

export async function createReferralVisitReward(_data: CreateReferralVisitRewardData) {
  return {
    success: false as const,
    message: "Referral-visit rewards are disabled until a trusted, abuse-resistant visit verification flow is implemented.",
  };
}
