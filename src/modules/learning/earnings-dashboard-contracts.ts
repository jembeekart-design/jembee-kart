/** Safe, owner-scoped earnings dashboard read model. No payout or transfer is performed. */
const SAFE_ID = /^[A-Za-z0-9_-]{1,128}$/;
const CURRENCY = /^[A-Z]{3}$/;
export const EARNINGS_DASHBOARD_LIMITS = Object.freeze({ maxRows: 500, maxAmountMinor: 1_000_000_000_000 });
export type EarningsRole = "creator" | "sharer" | "teacher";
export type EarningType = "ad_creator_share" | "ad_sharer_share" | "teacher_referral";
export type EarningsStatus = "pending" | "eligible" | "settled" | "reversed";
export type EarningsLedgerRow = {
  entryId: string; ownerUserId: string; ownerRole: EarningsRole; earningType: EarningType;
  amountMinor: number; currency: string; status: EarningsStatus; verified: boolean;
  reconciled: boolean; createdAt: string;
};
export type EarningsDashboardInput = {
  authenticatedUserId: string; rows: readonly EarningsLedgerRow[]; from?: string; to?: string; limit?: number;
};
export type EarningsCurrencySummary = {
  currency: string; pendingMinor: number; eligibleMinor: number; settledMinor: number;
  reversedMinor: number; netRecordedMinor: number; rowCount: number;
};
export type EarningsDashboard = {
  ownerUserId: string; rows: Array<Omit<EarningsLedgerRow, "ownerUserId">>;
  summaries: EarningsCurrencySummary[]; excludedRows: number;
};

/** Call only after server authentication and trusted ledger loading. Eligible does not mean payable. */
export function buildEarningsDashboard(input: EarningsDashboardInput): EarningsDashboard | null {
  const { authenticatedUserId, rows } = input;
  if (!SAFE_ID.test(authenticatedUserId) || !Array.isArray(rows) || rows.length > EARNINGS_DASHBOARD_LIMITS.maxRows) return null;
  const parseDate = (value: string | undefined): number | undefined => {
    if (value === undefined) return undefined;
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(value)) return NaN;
    const n = Date.parse(value);
    return Number.isFinite(n) ? n : NaN;
  };
  const from = parseDate(input.from), to = parseDate(input.to);
  if ((from !== undefined && !Number.isFinite(from)) || (to !== undefined && !Number.isFinite(to))
    || (from !== undefined && to !== undefined && from > to)) return null;
  const limit = input.limit ?? 100;
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > EARNINGS_DASHBOARD_LIMITS.maxRows) return null;
  const seen = new Set<string>();
  const safeRows: Array<Omit<EarningsLedgerRow, "ownerUserId">> = [];
  let excludedRows = 0;
  for (const row of rows) {
    const valid = row && SAFE_ID.test(row.entryId) && SAFE_ID.test(row.ownerUserId)
      && ["creator", "sharer", "teacher"].includes(row.ownerRole)
      && ["ad_creator_share", "ad_sharer_share", "teacher_referral"].includes(row.earningType)
      && ["pending", "eligible", "settled", "reversed"].includes(row.status)
      && Number.isSafeInteger(row.amountMinor) && Math.abs(row.amountMinor) <= EARNINGS_DASHBOARD_LIMITS.maxAmountMinor
      && CURRENCY.test(row.currency) && typeof row.verified === "boolean" && typeof row.reconciled === "boolean"
      && typeof row.createdAt === "string" && Number.isFinite(Date.parse(row.createdAt));
    if (!valid || seen.has(row.entryId)) { excludedRows++; continue; }
    seen.add(row.entryId);
    if (row.ownerUserId !== authenticatedUserId || !row.verified || !row.reconciled) { excludedRows++; continue; }
    if ((from !== undefined && Date.parse(row.createdAt) < from) || (to !== undefined && Date.parse(row.createdAt) > to)) { excludedRows++; continue; }
    if ((row.ownerRole === "creator" && row.earningType !== "ad_creator_share")
      || (row.ownerRole === "sharer" && row.earningType !== "ad_sharer_share")
      || (row.ownerRole === "teacher" && row.earningType !== "teacher_referral")) { excludedRows++; continue; }
    safeRows.push({ entryId: row.entryId, ownerRole: row.ownerRole, earningType: row.earningType,
      amountMinor: row.amountMinor, currency: row.currency, status: row.status,
      verified: row.verified, reconciled: row.reconciled, createdAt: row.createdAt });
  }
  safeRows.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || a.entryId.localeCompare(b.entryId));
  const visibleRows = safeRows.slice(0, limit);
  if (safeRows.length > limit) excludedRows += safeRows.length - limit;
  const byCurrency = new Map<string, EarningsCurrencySummary>();
  for (const row of visibleRows) {
    const summary = byCurrency.get(row.currency) ?? { currency: row.currency, pendingMinor: 0,
      eligibleMinor: 0, settledMinor: 0, reversedMinor: 0, netRecordedMinor: 0, rowCount: 0 };
    summary.rowCount++; summary.netRecordedMinor += row.amountMinor;
    if (row.status === "pending") summary.pendingMinor += row.amountMinor;
    if (row.status === "eligible") summary.eligibleMinor += row.amountMinor;
    if (row.status === "settled") summary.settledMinor += row.amountMinor;
    if (row.status === "reversed") summary.reversedMinor += row.amountMinor;
    byCurrency.set(row.currency, summary);
  }
  return { ownerUserId: authenticatedUserId, rows: visibleRows,
    summaries: [...byCurrency.values()].sort((a, b) => a.currency.localeCompare(b.currency)), excludedRows };
}
