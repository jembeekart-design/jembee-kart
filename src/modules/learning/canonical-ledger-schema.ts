/** Canonical settlement-ledger schema design and validation. No Firestore writes. */
const SAFE_ID = /^[A-Za-z0-9_-]{1,128}$/;
const CURRENCY = /^[A-Z]{3}$/;
export const CANONICAL_LEDGER_SCHEMA = Object.freeze({
  collection: "shortsSettlementLedger",
  version: 1,
  requiredFields: ["schemaVersion","entryId","ownerUid","ownerRole","earningType","sourceId","currency","amountMinor","status","verified","reconciled","createdAt","recordedAt"],
  immutableFields: ["entryId","ownerUid","ownerRole","earningType","sourceId","currency","amountMinor","createdAt"],
  mutableFields: ["status","reversalOf","reversedBy","updatedAt"],
  clientAccess: "deny_all",
});
export type CanonicalLedgerRecord = {
  schemaVersion: 1; entryId: string; ownerUid: string; ownerRole: "creator" | "sharer" | "teacher";
  earningType: "ad_creator_share" | "ad_sharer_share" | "teacher_referral";
  sourceId: string; currency: string; amountMinor: number;
  status: "pending" | "eligible" | "settled" | "reversed";
  verified: boolean; reconciled: boolean; createdAt: string; recordedAt: string;
  reversalOf?: string; reversedBy?: string; updatedAt?: string;
};
export type SchemaResult<T> = { ok: true; value: T } | { ok: false; reason: string };

export function validateCanonicalLedgerRecord(value: unknown): SchemaResult<CanonicalLedgerRecord> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ok:false, reason:"INVALID_RECORD" };
  const r = value as Record<string, unknown>;
  const allowed = new Set([...CANONICAL_LEDGER_SCHEMA.requiredFields, "reversalOf", "reversedBy", "updatedAt"]);
  if (Object.keys(r).some(k => !allowed.has(k)) || CANONICAL_LEDGER_SCHEMA.requiredFields.some(k => !(k in r)))
    return { ok:false, reason:"INVALID_FIELDS" };
  if (r.schemaVersion !== 1 || !SAFE_ID.test(String(r.entryId)) || !SAFE_ID.test(String(r.ownerUid))
    || !SAFE_ID.test(String(r.sourceId)) || !CURRENCY.test(String(r.currency))
    || !Number.isSafeInteger(r.amountMinor) || Math.abs(Number(r.amountMinor)) > 1_000_000_000_000
    || !["creator","sharer","teacher"].includes(String(r.ownerRole))
    || !["ad_creator_share","ad_sharer_share","teacher_referral"].includes(String(r.earningType))
    || !["pending","eligible","settled","reversed"].includes(String(r.status))
    || typeof r.verified !== "boolean" || typeof r.reconciled !== "boolean"
    || typeof r.createdAt !== "string" || !Number.isFinite(Date.parse(r.createdAt))
    || typeof r.recordedAt !== "string" || !Number.isFinite(Date.parse(r.recordedAt)))
    return { ok:false, reason:"INVALID_VALUE" };
  if ((r.ownerRole === "creator" && r.earningType !== "ad_creator_share")
    || (r.ownerRole === "sharer" && r.earningType !== "ad_sharer_share")
    || (r.ownerRole === "teacher" && r.earningType !== "teacher_referral"))
    return { ok:false, reason:"ROLE_EARNING_TYPE_MISMATCH" };
  if (r.status === "reversed" && (!SAFE_ID.test(String(r.reversalOf ?? ""))))
    return { ok:false, reason:"REVERSAL_LINK_REQUIRED" };
  if (r.reversalOf !== undefined && !SAFE_ID.test(String(r.reversalOf))) return { ok:false, reason:"INVALID_REVERSAL_LINK" };
  if (r.reversedBy !== undefined && !SAFE_ID.test(String(r.reversedBy))) return { ok:false, reason:"INVALID_REVERSAL_LINK" };
  if (r.updatedAt !== undefined && (typeof r.updatedAt !== "string" || !Number.isFinite(Date.parse(r.updatedAt))))
    return { ok:false, reason:"INVALID_UPDATED_AT" };
  return { ok:true, value:r as unknown as CanonicalLedgerRecord };
}

/** Existing settled rows are immutable; corrections must be new linked compensating entries. */
export function canMutateLedgerRecord(input: {
  changedFields: readonly string[]; fromStatus: string; toStatus: string;
  hasLinkedReversal: boolean;
}): boolean {
  if (!Array.isArray(input.changedFields) || input.changedFields.length === 0) return false;
  if (input.changedFields.some(k => (CANONICAL_LEDGER_SCHEMA.immutableFields as readonly string[]).includes(k))) return false;
  if (input.fromStatus === "settled" || input.fromStatus === "reversed") return false;
  if (input.toStatus === "reversed" && !input.hasLinkedReversal) return false;
  return input.changedFields.every(k => (CANONICAL_LEDGER_SCHEMA.mutableFields as readonly string[]).includes(k));
}

/** Migration is an explicit, reversible project; this contract never authorizes automatic legacy mutation. */
export function isLegacyMigrationApproved(input: {
  inventoryComplete: boolean; backupVerified: boolean; mappingReviewed: boolean;
  dryRunPassed: boolean; ownerApproval: boolean; rollbackPlan: boolean;
}): boolean {
  return Object.values(input).every(v => v === true);
}
