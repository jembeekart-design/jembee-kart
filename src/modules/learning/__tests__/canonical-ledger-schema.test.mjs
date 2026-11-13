import { test } from "node:test";
import assert from "node:assert/strict";
import { CANONICAL_LEDGER_SCHEMA, validateCanonicalLedgerRecord, canMutateLedgerRecord, isLegacyMigrationApproved } from "../canonical-ledger-schema.ts";
const row = { schemaVersion:1, entryId:"led_1", ownerUid:"user_1", ownerRole:"creator", earningType:"ad_creator_share", sourceId:"ad_1", currency:"INR", amountMinor:3000, status:"eligible", verified:true, reconciled:true, createdAt:"2026-11-12T10:00:00Z", recordedAt:"2026-11-12T10:01:00Z" };
test("defines server-only canonical collection and explicit versioned schema", () => {
 assert.equal(CANONICAL_LEDGER_SCHEMA.collection,"shortsSettlementLedger"); assert.equal(CANONICAL_LEDGER_SCHEMA.version,1); assert.equal(CANONICAL_LEDGER_SCHEMA.clientAccess,"deny_all");
});
test("accepts valid version-one canonical ledger row", () => { assert.deepEqual(validateCanonicalLedgerRecord(row),{ok:true,value:row}); });
test("rejects missing fields, unknown fields, unsafe IDs and invalid currency", () => {
 assert.equal(validateCanonicalLedgerRecord({...row,ownerUid:"../u"}).ok,false);
 assert.equal(validateCanonicalLedgerRecord({...row,currency:"INR!"}).ok,false);
 assert.equal(validateCanonicalLedgerRecord({...row,unknown:"x"}).ok,false);
 const missing={...row}; delete missing.recordedAt; assert.equal(validateCanonicalLedgerRecord(missing).ok,false);
});
test("requires integer bounded minor-unit amount and boolean verification flags", () => {
 assert.equal(validateCanonicalLedgerRecord({...row,amountMinor:1.2}).ok,false);
 assert.equal(validateCanonicalLedgerRecord({...row,amountMinor:1e15}).ok,false);
 assert.equal(validateCanonicalLedgerRecord({...row,reconciled:"true"}).ok,false);
});
test("enforces owner role and earning type pairing", () => {
 assert.equal(validateCanonicalLedgerRecord({...row,ownerRole:"teacher"}).reason,"ROLE_EARNING_TYPE_MISMATCH");
 assert.equal(validateCanonicalLedgerRecord({...row,ownerRole:"sharer",earningType:"ad_sharer_share"}).ok,true);
});
test("reversal rows require safe link to original entry", () => {
 assert.equal(validateCanonicalLedgerRecord({...row,status:"reversed"}).reason,"REVERSAL_LINK_REQUIRED");
 assert.equal(validateCanonicalLedgerRecord({...row,status:"reversed",reversalOf:"led_0"}).ok,true);
});
test("immutable fields and settled history cannot be mutated", () => {
 assert.equal(canMutateLedgerRecord({changedFields:["amountMinor"],fromStatus:"eligible",toStatus:"eligible",hasLinkedReversal:false}),false);
 assert.equal(canMutateLedgerRecord({changedFields:["status"],fromStatus:"settled",toStatus:"reversed",hasLinkedReversal:true}),false);
 assert.equal(canMutateLedgerRecord({changedFields:["updatedAt"],fromStatus:"eligible",toStatus:"eligible",hasLinkedReversal:false}),true);
});
test("status reversal requires linked compensating record", () => {
 assert.equal(canMutateLedgerRecord({changedFields:["status"],fromStatus:"eligible",toStatus:"reversed",hasLinkedReversal:false}),false);
 assert.equal(canMutateLedgerRecord({changedFields:["status","reversedBy"],fromStatus:"eligible",toStatus:"reversed",hasLinkedReversal:true}),true);
});
test("legacy migration requires every explicit safety gate", () => {
 const all={inventoryComplete:true,backupVerified:true,mappingReviewed:true,dryRunPassed:true,ownerApproval:true,rollbackPlan:true};
 assert.equal(isLegacyMigrationApproved(all),true);
 for(const k of Object.keys(all)) assert.equal(isLegacyMigrationApproved({...all,[k]:false}),false);
});
