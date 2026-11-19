import { test } from "node:test";
import assert from "node:assert/strict";
import { getEarningsCollectionInventory, classifyEarningsCollection } from "../legacy-earnings-inventory.ts";
test("inventory records the active paid-video settlement ledger and evidence",()=>{
 const x=classifyEarningsCollection("shortsSettlementLedger");
 assert.equal(x.domain,"paid_video_settlement"); assert.equal(x.migrationClass,"retain_and_reconcile"); assert.ok(x.evidence.some(v=>v.includes("cashfree/webhook")));
});
test("paid-video orders, purchases and events remain separate source domains",()=>{
 assert.equal(classifyEarningsCollection("watchVideoPaymentOrders").domain,"paid_video_orders");
 assert.equal(classifyEarningsCollection("watchVideoPurchases").domain,"paid_video_entitlements");
 assert.equal(classifyEarningsCollection("watchVideoPaymentEvents").domain,"provider_payment_events");
});
test("verified expenses and referral attribution are not earnings rows",()=>{
 assert.equal(classifyEarningsCollection("shortsVerifiedExpenses").domain,"verified_costs");
 assert.equal(classifyEarningsCollection("teacherReferralAttributions").domain,"teacher_referral_attribution");
});
test("Monetag collections remain a separate external USD legacy domain",()=>{
 for(const n of ["monetagRevenueImports","monetagEarnings","monetagPayments","monetagShareAttributions"]) assert.equal(classifyEarningsCollection(n).migrationClass,"separate_legacy_domain");
});
test("legacy creator earnings collection is marked unverified, not assumed compatible",()=>{
 assert.equal(classifyEarningsCollection("creatorAdEarnings").migrationClass,"unverified_legacy");
});
test("unknown collections are not guessed and no inventory item authorizes deletion",()=>{
 assert.equal(classifyEarningsCollection("unknownEarnings"),null);
 assert.ok(getEarningsCollectionInventory().every(x=>x.destructiveActionAllowed===false));
});
test("inventory is defensive-copy read-only metadata",()=>{
 const a=getEarningsCollectionInventory(); a[0].evidence.push("fake");
 assert.ok(!getEarningsCollectionInventory()[0].evidence.includes("fake"));
});
