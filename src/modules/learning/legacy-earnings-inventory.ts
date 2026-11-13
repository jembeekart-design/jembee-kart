/** Read-only inventory of observed Firestore money-related collections in source. */
export const LEGACY_EARNINGS_COLLECTION_INVENTORY = Object.freeze([
  { collection:"shortsSettlementLedger", domain:"paid_video_settlement", observedRole:"active canonical-like ledger", evidence:["src/app/api/payments/cashfree/webhook/route.ts","src/app/api/shorts/paid-video/verify/route.ts","src/app/api/admin/shorts/paid-video-refunds/reconcile/route.ts","src/app/api/admin/shorts/teacher-referral/reconcile/route.ts"], migrationClass:"retain_and_reconcile", destructiveActionAllowed:false },
  { collection:"watchVideoPaymentOrders", domain:"paid_video_orders", observedRole:"payment/order source of truth", evidence:["src/app/api/shorts/paid-video/create-order/route.ts","src/app/api/payments/cashfree/webhook/route.ts"], migrationClass:"retain_as_source", destructiveActionAllowed:false },
  { collection:"watchVideoPurchases", domain:"paid_video_entitlements", observedRole:"playback entitlement", evidence:["src/app/api/payments/cashfree/webhook/route.ts","src/app/api/shorts/paid-video/playback-session/route.ts"], migrationClass:"retain_as_source", destructiveActionAllowed:false },
  { collection:"watchVideoPaymentEvents", domain:"provider_payment_events", observedRole:"payment event idempotency", evidence:["src/app/api/payments/cashfree/webhook/route.ts","src/app/api/shorts/paid-video/verify/route.ts"], migrationClass:"retain_as_source", destructiveActionAllowed:false },
  { collection:"shortsVerifiedExpenses", domain:"verified_costs", observedRole:"reviewed platform costs", evidence:["src/app/api/admin/shorts/expenses/route.ts","src/app/api/admin/shorts/expenses/verify/route.ts","src/app/api/admin/shorts/teacher-referral/reconcile/route.ts"], migrationClass:"retain_as_source", destructiveActionAllowed:false },
  { collection:"teacherReferralAttributions", domain:"teacher_referral_attribution", observedRole:"verified referral relationship", evidence:["src/app/api/shorts/paid-video/create-order/route.ts","src/app/api/admin/shorts/teacher-referral/reconcile/route.ts"], migrationClass:"retain_as_source", destructiveActionAllowed:false },
  { collection:"monetagRevenueImports", domain:"external_ad_revenue_import", observedRole:"admin imported external revenue", evidence:["src/app/api/admin/monetag-revenue/route.ts"], migrationClass:"separate_legacy_domain", destructiveActionAllowed:false },
  { collection:"monetagEarnings", domain:"external_ad_earnings", observedRole:"USD uploader/sharer earnings", evidence:["src/app/api/admin/monetag-revenue/route.ts","src/app/api/monetag/earnings/route.ts","src/app/api/admin/monetag-payments/route.ts"], migrationClass:"separate_legacy_domain", destructiveActionAllowed:false },
  { collection:"monetagPayments", domain:"external_ad_payment_records", observedRole:"admin-entered USD payment history; no transfer by route", evidence:["src/app/api/admin/monetag-payments/route.ts","src/app/api/monetag/earnings/route.ts"], migrationClass:"separate_legacy_domain", destructiveActionAllowed:false },
  { collection:"creatorAdEarnings", domain:"legacy_creator_ad_earnings", observedRole:"profile API reads AVAILABLE creatorAmount", evidence:["src/app/api/profile/watch-data/route.ts"], migrationClass:"unverified_legacy", destructiveActionAllowed:false },
  { collection:"monetagShareAttributions", domain:"share_attribution", observedRole:"admin dashboard attribution query", evidence:["src/app/api/admin/monetag-revenue/route.ts"], migrationClass:"separate_legacy_domain", destructiveActionAllowed:false },
]);

export function getEarningsCollectionInventory() {
  return LEGACY_EARNINGS_COLLECTION_INVENTORY.map(item => ({ ...item, evidence:[...item.evidence] }));
}

export function classifyEarningsCollection(name: string) {
  return LEGACY_EARNINGS_COLLECTION_INVENTORY.find(item => item.collection === name) ?? null;
}
