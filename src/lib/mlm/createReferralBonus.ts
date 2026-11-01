interface ReferralBonusRequest {
  newUserId: string;
  referrerId: string;
  orderId: string;
  packageId: string;
}

/**
 * Legacy browser-side referral payout is intentionally disabled.
 * Financial referral commissions must be issued by a trusted server-side
 * order pipeline after payment and sponsor eligibility are verified.
 */
export async function createReferralBonus(_data: ReferralBonusRequest) {
  console.warn(
    "Legacy client-side referral bonus payout is disabled; use the trusted server payout pipeline."
  );

  return {
    success: false,
    errorCode: "SERVER_PROCESSING_REQUIRED",
    message: "Referral commission cannot be issued from the client.",
  };
}
