/**
 * Phase 32: pure repository contracts for the currently observed paid-video
 * shortsSettlementLedger shape. This is NOT a Firestore adapter and performs
 * no I/O. Preserve existing field names and INR paise units.
 */

const ENTRY_POLICIES = Object.freeze({
  creator_share: { beneficiary: "creator", sign: "nonnegative" },
  sharer_share: { beneficiary: "sharer", sign: "nonnegative" },
  sharer_share_unallocated: { beneficiary: "unallocated_sharer", sign: "nonnegative" },
  platform_share: { beneficiary: "platform", sign: "nonnegative" },
  creator_share_reversal: { beneficiary: "creator", sign: "nonpositive" },
  sharer_share_reversal: { beneficiary: "sharer", sign: "nonpositive" },
  platform_share_reversal: { beneficiary: "platform", sign: "nonpositive" },
  teacher_referral_commission: { beneficiary: "referrer_or_null", sign: "nonnegative" },
  teacher_referral_commission_adjustment: { beneficiary: "referrer_or_null", sign: "signed" },
  admin_net_profit: { beneficiary: "platform_admin", sign: "nonnegative" },
} as const);

type SettlementEntryType = keyof typeof ENTRY_POLICIES;
type EntryPolicy = (typeof ENTRY_POLICIES)[SettlementEntryType];

type ContractResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: string };

type ObservedSettlementEntry = {
  orderId: string;
  videoId: string;
  entryType: SettlementEntryType;
  amountPaise: number;
  currency: "INR";
  beneficiaryUid?: string | null;
  [key: string]: unknown;
};

type SettlementCreate = {
  documentId: string;
  data: unknown;
};

type SettlementCreatePlan = {
  ok: true;
  creates: Array<{ documentId: string; data: ObservedSettlementEntry }>;
  skips: string[];
  readBeforeWriteRequired: true;
};

const ID_PATTERN = /^[A-Za-z0-9_-]{1,180}$/;

const SAFE_ID = (value: unknown): value is string =>
  typeof value === "string" && ID_PATTERN.test(value);

const isEntryType = (value: unknown): value is SettlementEntryType =>
  typeof value === "string" && Object.hasOwn(ENTRY_POLICIES, value);

const objectRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export function getObservedSettlementEntryPolicy(
  entryType: unknown,
): EntryPolicy | null {
  if (!isEntryType(entryType)) return null;
  return { ...ENTRY_POLICIES[entryType] };
}

export function validateObservedSettlementEntry(
  input: unknown,
): ContractResult<ObservedSettlementEntry> {
  const fail = (reason: string): ContractResult<never> => ({
    ok: false,
    reason,
  });

  if (!objectRecord(input)) return fail("INVALID_ENTRY");

  if (!SAFE_ID(input.orderId) || !SAFE_ID(input.videoId)) {
    return fail("INVALID_ORDER_OR_VIDEO_ID");
  }

  if (!isEntryType(input.entryType)) {
    return fail("UNSUPPORTED_ENTRY_TYPE");
  }

  if (
    typeof input.amountPaise !== "number" ||
    !Number.isSafeInteger(input.amountPaise)
  ) {
    return fail("INVALID_AMOUNT_PAISE");
  }

  if (input.currency !== "INR") return fail("UNSUPPORTED_CURRENCY");

  const policy = ENTRY_POLICIES[input.entryType];

  if (policy.sign === "nonnegative" && input.amountPaise < 0) {
    return fail("NEGATIVE_AMOUNT_NOT_ALLOWED");
  }

  if (policy.sign === "nonpositive" && input.amountPaise > 0) {
    return fail("POSITIVE_REVERSAL_NOT_ALLOWED");
  }

  if (
    input.beneficiaryUid !== null &&
    input.beneficiaryUid !== undefined &&
    !SAFE_ID(input.beneficiaryUid) &&
    input.beneficiaryUid !== "platform" &&
    input.beneficiaryUid !== "platform_admin"
  ) {
    return fail("INVALID_BENEFICIARY");
  }

  if (
    input.entryType === "sharer_share_unallocated" &&
    input.beneficiaryUid != null
  ) {
    return fail("UNALLOCATED_SHARE_HAS_BENEFICIARY");
  }

  if (
    input.entryType === "admin_net_profit" &&
    input.beneficiaryUid !== "platform_admin"
  ) {
    return fail("INVALID_PLATFORM_ADMIN_BENEFICIARY");
  }

  return {
    ok: true,
    value: { ...input } as ObservedSettlementEntry,
  };
}

/**
 * Plans create-only writes after the caller has read every deterministic
 * document reference inside its Firestore transaction. Existing IDs are
 * skipped (idempotent replay); conflicting duplicate IDs in one batch fail.
 */
export function planSettlementLedgerCreates(
  entries: unknown,
  existingDocumentIds: unknown = [],
): SettlementCreatePlan | { ok: false; reason: string } {
  if (!Array.isArray(entries) || !Array.isArray(existingDocumentIds)) {
    return { ok: false, reason: "INVALID_BATCH" };
  }

  const existing = new Set<unknown>(existingDocumentIds);
  const seen = new Set<string>();
  const creates: SettlementCreatePlan["creates"] = [];
  const skips: string[] = [];

  for (const item of entries as unknown[]) {
    if (!objectRecord(item) || !SAFE_ID(item.documentId)) {
      return { ok: false, reason: "INVALID_DOCUMENT_ID" };
    }

    const documentId = item.documentId;
    const checked = validateObservedSettlementEntry(item.data);

    if (checked.ok === false) return checked;

    if (seen.has(documentId)) {
      return { ok: false, reason: "DUPLICATE_DOCUMENT_ID_IN_BATCH" };
    }

    seen.add(documentId);

    if (existing.has(documentId)) {
      skips.push(documentId);
    } else {
      creates.push({ documentId, data: checked.value });
    }
  }

  return {
    ok: true,
    creates,
    skips,
    readBeforeWriteRequired: true,
  };
}

/** Immutable ledger rows may be corrected only by a new compensating row. */
export function canMutateObservedSettlementEntry(
  operation: unknown,
  entryType: unknown,
): boolean {
  if (!isEntryType(entryType)) return false;

  return operation === "read" || operation === "append_compensation";
}

export function makePaidVideoLedgerDocumentIds(
  orderId: unknown,
): {
  creator: string;
  sharer: string;
  platform: string;
  adminNetProfit: string;
  teacherReferral: string;
} | null {
  if (!SAFE_ID(orderId)) return null;

  return {
    creator: `paidvideo_${orderId}_creator`,
    sharer: `paidvideo_${orderId}_sharer`,
    platform: `paidvideo_${orderId}_platform`,
    adminNetProfit: `paidvideo_${orderId}_admin_net_profit`,
    teacherReferral: `paidvideo_${orderId}_teacher_referral`,
  };
}
