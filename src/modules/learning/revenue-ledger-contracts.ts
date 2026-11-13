/** Reconciled course/ad revenue ledger policy primitives. No payout or provider transfer is performed here. */
const SAFE_ID = /^[A-Za-z0-9_-]{1,128}$/;
export const REVENUE_LEDGER_LIMITS = Object.freeze({ maxAmountMinor: 1_000_000_000_000, maxEntries: 10000 });
export type LedgerResult<T> = { ok: true; value: T } | { ok: false; reason: string };
export type RevenueSource = "eligible_ad_revenue" | "paid_course_net_revenue";
export type RevenueEntry = {
  entryId: string; source: RevenueSource; currency: string; grossMinor: number;
  refundsMinor: number; chargebacksMinor: number; providerFeesMinor: number;
  verified: boolean; reconciled: boolean; status: "pending" | "eligible" | "reversed";
};
export type RevenueAllocation = { creatorMinor: number; sharerMinor: number; platformMinor: number; distributableMinor: number };

/** Only verified, reconciled, eligible ad revenue participates in the 30/20/50 creator/sharer/platform split. */
export function allocateEligibleAdRevenue(entry: RevenueEntry): LedgerResult<RevenueAllocation> {
  if (!SAFE_ID.test(entry.entryId) || entry.source !== "eligible_ad_revenue" || !/^[A-Z]{3}$/.test(entry.currency)
    || ![entry.grossMinor, entry.refundsMinor, entry.chargebacksMinor, entry.providerFeesMinor].every(Number.isSafeInteger)
    || entry.grossMinor < 0 || entry.grossMinor > REVENUE_LEDGER_LIMITS.maxAmountMinor
    || entry.refundsMinor < 0 || entry.chargebacksMinor < 0 || entry.providerFeesMinor < 0
    || entry.refundsMinor + entry.chargebacksMinor + entry.providerFeesMinor > entry.grossMinor) return { ok: false, reason: "INVALID_REVENUE_ENTRY" };
  if (!entry.verified || !entry.reconciled || entry.status !== "eligible") return { ok: false, reason: "REVENUE_NOT_ELIGIBLE" };
  const distributableMinor = entry.grossMinor - entry.refundsMinor - entry.chargebacksMinor - entry.providerFeesMinor;
  const creatorMinor = Math.floor(distributableMinor * 30 / 100);
  const sharerMinor = Math.floor(distributableMinor * 20 / 100);
  const platformMinor = distributableMinor - creatorMinor - sharerMinor;
  return { ok: true, value: { creatorMinor, sharerMinor, platformMinor, distributableMinor } };
}

/** Teacher referral is 2% of actual verified platform net profit on eligible paid-course revenue, never gross payment. */
export function calculateTeacherReferralMinor(input: {
  eligiblePaidCourse: boolean; revenueVerified: boolean; reconciled: boolean;
  platformNetProfitMinor: number; currency: string;
}): LedgerResult<number> {
  if (!/^[A-Z]{3}$/.test(input.currency) || !Number.isSafeInteger(input.platformNetProfitMinor)
    || input.platformNetProfitMinor < 0 || input.platformNetProfitMinor > REVENUE_LEDGER_LIMITS.maxAmountMinor) return { ok: false, reason: "INVALID_NET_PROFIT" };
  if (!input.eligiblePaidCourse || !input.revenueVerified || !input.reconciled) return { ok: false, reason: "REFERRAL_NOT_ELIGIBLE" };
  return { ok: true, value: Math.floor(input.platformNetProfitMinor * 2 / 100) };
}

/** Append-only ledger identity is idempotent; an existing entry ID must never be applied twice. */
export function canAppendLedgerEntry(input: { entryId: string; existingEntryIds: readonly string[]; verified: boolean; reconciled: boolean }): boolean {
  return SAFE_ID.test(input.entryId) && input.existingEntryIds.length <= REVENUE_LEDGER_LIMITS.maxEntries
    && !input.existingEntryIds.includes(input.entryId) && input.verified && input.reconciled;
}

/** Reversal is represented by a linked compensating entry, never by mutating historical settled amounts. */
export function canCreateReversal(input: { originalEntryId: string; reversalEntryId: string; originalExists: boolean; alreadyReversed: boolean }): boolean {
  return SAFE_ID.test(input.originalEntryId) && SAFE_ID.test(input.reversalEntryId)
    && input.originalEntryId !== input.reversalEntryId && input.originalExists && !input.alreadyReversed;
}

/** Payout readiness is deliberately false unless all external reconciliation and compliance gates pass. */
export function isPayoutReady(input: {
  ledgerReconciled: boolean; recipientVerified: boolean; taxAndComplianceCleared: boolean;
  payoutProviderConfigured: boolean; explicitAdminApproval: boolean; livePayoutsEnabled: boolean;
}): boolean {
  return input.ledgerReconciled && input.recipientVerified && input.taxAndComplianceCleared
    && input.payoutProviderConfigured && input.explicitAdminApproval && input.livePayoutsEnabled;
}
