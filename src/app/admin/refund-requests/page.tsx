"use client";

import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { RefreshCcw, User, Package, IndianRupee, CheckCircle2, XCircle, Clock3, ShieldAlert, SearchCheck } from "lucide-react";
import { auth } from "@/firebase/config";

interface Reconciliation {
  status: string;
  manualReviewRequired: boolean;
  paidAmountPaise: number;
  providerTotalAmountPaise: number | null;
  providerCommittedAmountPaise: number | null;
  remainingCommittedCapacityPaise: number | null;
  providerRefundCount: number | null;
  localRequestCount?: number;
  malformedProviderRows?: number;
  unknownProviderStatuses?: number;
  duplicateLocalRequestCount?: number;
  duplicateLocalRefundIds?: string[];
  localHistoryTruncated?: boolean;
  localHistoryLimit?: number;
  overRefunded?: boolean;
  unmatchedProviderRefundIds?: string[];
  unmatchedLocalRequestIds?: string[];
  matches?: Array<{ requestId: string; refundId: string; amountPaise: number | null; providerStatus: string | null; providerAmountPaise: number | null; match: string }>;
  readOnly: boolean;
}

interface RefundCurrentRecordCheck {
  status: "consistent" | "review_required";
  issues: string[];
  linkedOrderId: string | null;
  refundStatus: string | null;
  refundExecutionStatus: string | null;
  orderPaymentMethod: string | null;
  orderPaymentStatus: string | null;
  reservationStatus: string | null;
  reservedAmountPaise: number | null;
}

interface RefundAuditEvent {
  id: string;
  action: string;
  adminId: string | null;
  orderId: string | null;
  refundId: string | null;
  providerStatus: string | null;
  committedStatus: string | null;
  committedExecutionStatus: string | null;
  errorCode: string | null;
  amount: number | null;
  amountPaise: number | null;
  reservationReleased: boolean | null;
  createdAt: string | null;
  qualityIssues: string[];
  dataQuality: "valid" | "review_required";
}

interface RefundRequest {
  id: string;
  userName: string;
  productName: string;
  amount: number;
  amountValid?: boolean;
  dataQualityIssues?: string[];
  reason: string;
  status: string;
  refundExecutionStatus?: string;
  providerRefundStatus?: string | null;
  refundArn?: string | null;
  orderId?: string | null;
  createdAt?: string | null;
}

export default function RefundRequestsPage() {
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [reconciliations, setReconciliations] = useState<Record<string, Reconciliation>>({});
  const [auditHistory, setAuditHistory] = useState<Record<string, RefundAuditEvent[]>>({});
  const [auditHasMore, setAuditHasMore] = useState<Record<string, boolean>>({});
  const [auditNextCursor, setAuditNextCursor] = useState<Record<string, string | null>>({});
  const [auditLoadingId, setAuditLoadingId] = useState<string | null>(null);
  const [auditErrors, setAuditErrors] = useState<Record<string, string>>({});
  const [auditRecordChecks, setAuditRecordChecks] = useState<Record<string, RefundCurrentRecordCheck | null>>({});

  const loadRequests = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      setMessage("Please sign in with an admin account.");
      setLoading(false);
      return;
    }
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/refund-requests", {
        headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error(result.message || "Could not load refund requests");
      setRequests(Array.isArray(result.requests) ? result.requests : []);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load refund requests");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) void loadRequests();
      else { setRequests([]); setReconciliations({}); setMessage("Please sign in with an admin account."); setLoading(false); }
    });
    return unsubscribe;
  }, [loadRequests]);

  async function loadAuditHistory(id: string, append = false) {
    const user = auth.currentUser;
    if (!user) { setAuditErrors((current) => ({ ...current, [id]: "Please sign in again." })); return; }
    const cursor = append ? auditNextCursor[id] : null;
    if (append && !cursor) return;
    setAuditLoadingId(id);
    setAuditErrors((current) => ({ ...current, [id]: "" }));
    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams({ requestId: id });
      if (cursor) params.set("cursor", cursor);
      const response = await fetch(`/api/admin/refund-requests/audit?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error(result.message || "Could not load audit history");
      const events = Array.isArray(result.events) ? result.events as RefundAuditEvent[] : [];
      setAuditRecordChecks((current) => ({ ...current, [id]: result.currentRecordCheck && typeof result.currentRecordCheck === "object" ? result.currentRecordCheck as RefundCurrentRecordCheck : null }));
      setAuditHistory((current) => ({ ...current, [id]: append ? [...(current[id] || []), ...events] : events }));
      setAuditHasMore((current) => ({ ...current, [id]: result.hasMore === true }));
      setAuditNextCursor((current) => ({ ...current, [id]: typeof result.nextCursor === "string" ? result.nextCursor : null }));
    } catch (error) {
      setAuditErrors((current) => ({ ...current, [id]: error instanceof Error ? error.message : "Could not load audit history" }));
    } finally { setAuditLoadingId(null); }
  }

  async function updateStatus(id: string, action: "approve" | "reject" | "process" | "refresh" | "reconcile") {
    const user = auth.currentUser;
    if (!user) { setMessage("Please sign in again."); return; }
    setBusyId(id); setMessage("");
    try {
      const token = await user.getIdToken();
      const endpoint = action === "process" || action === "refresh" || action === "reconcile" ? "/api/admin/refund-requests/process" : "/api/admin/refund-requests";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id, action }),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error(result.message || "Refund request could not be updated");
      if (action === "reconcile" && result.reconciliation) {
        setReconciliations((current) => ({ ...current, [id]: result.reconciliation as Reconciliation }));
        setMessage(result.reconciliation.manualReviewRequired ? "Reconciliation found issues requiring manual review." : "Provider and local refund records matched.");
      } else {
        setMessage(result.message || "Refund request updated.");
        await loadRequests();
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Refund request could not be updated"); }
    finally { setBusyId(null); }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[var(--card-color)] text-[var(--button-text-color)]">Loading Refund Requests...</div>;

  return (
    <main className="min-h-screen bg-[var(--color-page-background)] p-4 text-[var(--button-text-color)]">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--primary-color)]"><RefreshCcw size={30} /></div>
        <div><h1 className="text-3xl font-black">Refund Requests</h1><p className="mt-1 text-sm text-[var(--muted-text-color)]">Review customer refund requests and provider reconciliation</p></div>
      </div>
      <p className="mb-5 rounded-xl border border-[var(--color-border)] bg-[var(--card-color)] p-4 text-sm text-[var(--text-secondary)]">Approval does not mean money has been returned. Automatic processing is available only for verified Cashfree-paid orders. COD/manual bank refunds require a separately verified payout workflow. Reconciliation is read-only; mismatches require manual review.</p>
      {message && <p role="status" className="mb-5 rounded-xl bg-[var(--card-color)] p-4">{message}</p>}
      <div className="space-y-5">
        {requests.length === 0 && <div className="rounded-[30px] bg-[var(--primary-color)] p-10 text-center">No Refund Requests Found</div>}
        {requests.map((request) => {
          const pending = ["pending", "requested"].includes(request.status.toLowerCase()) && request.amountValid !== false;
          const reconciliation = reconciliations[request.id];
          return (
            <div key={request.id} className="rounded-[30px] bg-[var(--primary-color)] p-5">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-3"><User size={20} /><h2 className="text-2xl font-black">{request.userName}</h2></div>
                    <div className="mt-4 flex flex-col gap-2 text-[var(--text-color)]">
                      <div className="flex items-center gap-2"><Package size={16} />{request.productName}</div>
                      <div className="flex items-center gap-2"><IndianRupee size={16} />{request.amount.toFixed(2)}</div>
                      {request.amountValid === false && <p className="text-sm font-semibold text-[var(--danger-color)]">Invalid refund amount — manual review required</p>}
                      {!!request.dataQualityIssues?.length && <p className="text-xs text-[var(--text-secondary)]">Data checks: {request.dataQualityIssues.join(", ").replaceAll("_", " ")}</p>}
                      {request.orderId && <div className="text-sm">Order: {request.orderId}</div>}
                    </div>
                  </div>
                  <div className="space-y-2"><StatusBadge status={request.status} />
                    {request.providerRefundStatus && <p className="text-xs text-[var(--text-secondary)]">Cashfree: {request.providerRefundStatus}</p>}
                    {request.refundArn && <p className="text-xs break-all text-[var(--text-secondary)]">ARN: {request.refundArn}</p>}
                  </div>
                </div>
                <div className="rounded-2xl bg-[var(--card-color)]/30 p-4"><h3 className="mb-2 font-bold">Refund Reason</h3><p className="whitespace-pre-wrap break-words text-[var(--text-color)]">{request.reason}</p></div>
                {pending && <div className="flex flex-wrap gap-3">
                  <button disabled={busyId === request.id} onClick={() => void updateStatus(request.id, "approve")} className="flex items-center gap-2 rounded-2xl bg-[var(--success-color)] px-5 py-3 font-bold text-[var(--text-color)] disabled:opacity-50"><CheckCircle2 size={18} /> Approve for processing</button>
                  <button disabled={busyId === request.id} onClick={() => void updateStatus(request.id, "reject")} className="flex items-center gap-2 rounded-2xl bg-[var(--danger-color)] px-5 py-3 font-bold disabled:opacity-50"><XCircle size={18} /> Reject</button>
                </div>}
                {["approved_pending_refund", "refund_retry_required", "refund_processing"].includes(request.status.toLowerCase()) && <button disabled={busyId === request.id} onClick={() => void updateStatus(request.id, "process")} className="rounded-2xl bg-[var(--success-color)] px-5 py-3 font-bold disabled:opacity-50">Process Refund (Cashfree only)</button>}
                {["refund_submitted", "refunded", "refund_failed", "refund_manual_review_required"].includes(request.status.toLowerCase()) && <div className="flex flex-wrap gap-3">
                  <button disabled={busyId === request.id} onClick={() => void updateStatus(request.id, "refresh")} className="rounded-2xl border border-[var(--color-border)] px-5 py-3 font-bold disabled:opacity-50">Refresh Cashfree Status</button>
                  <button disabled={busyId === request.id} onClick={() => void updateStatus(request.id, "reconcile")} className="flex items-center gap-2 rounded-2xl border border-[var(--color-border)] px-5 py-3 font-bold disabled:opacity-50"><SearchCheck size={18} /> Reconcile Provider Ledger</button>
                </div>}
                <div className="space-y-2">
                  <button disabled={auditLoadingId === request.id} onClick={() => void loadAuditHistory(request.id)} className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-bold disabled:opacity-50">
                    {auditLoadingId === request.id ? "Loading audit history..." : "View audit history"}
                  </button>
                  {auditErrors[request.id] && <p role="alert" className="text-sm text-[var(--danger-color)]">{auditErrors[request.id]}</p>}
                  {auditHistory[request.id] && <AuditHistoryPanel
                    events={auditHistory[request.id]}
                    currentRecordCheck={auditRecordChecks[request.id] || null}
                    hasMore={auditHasMore[request.id] === true}
                    loading={auditLoadingId === request.id}
                    onLoadMore={() => void loadAuditHistory(request.id, true)}
                  />}
                </div>
                {reconciliation && <ReconciliationPanel data={reconciliation} />}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

function AuditHistoryPanel({ events, currentRecordCheck, hasMore, loading, onLoadMore }: {
  events: RefundAuditEvent[];
  currentRecordCheck: RefundCurrentRecordCheck | null;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--card-color)] p-4" aria-live="polite">
      <h3 className="font-bold">Refund audit history</h3>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">Read-only · Loaded {events.length} event(s) · 50 per page</p>
      {currentRecordCheck && <div className="mt-3 rounded-xl border border-[var(--color-border)] p-3 text-sm">
        <div className="font-semibold">Current refund/order consistency: {currentRecordCheck.status === "consistent" ? "No detected mismatch" : "Review required"}</div>
        {currentRecordCheck.issues.length > 0 && <p className="mt-1 text-xs font-semibold text-[var(--danger-color)]">{currentRecordCheck.issues.join(", ").replaceAll("_", " ")}</p>}
        <div className="mt-1 text-xs text-[var(--text-secondary)]">Order: {currentRecordCheck.linkedOrderId || "Unavailable"} · Refund: {currentRecordCheck.refundStatus || "Unknown"} / {currentRecordCheck.refundExecutionStatus || "Unknown"} · Payment: {currentRecordCheck.orderPaymentMethod || "Unknown"} / {currentRecordCheck.orderPaymentStatus || "Unknown"}</div>
        <div className="text-xs text-[var(--text-secondary)]">Reservation: {currentRecordCheck.reservationStatus || "Not active / unavailable"} · Reserved: {currentRecordCheck.reservedAmountPaise !== null ? `${currentRecordCheck.reservedAmountPaise} paise` : "Unavailable"}</div>
      </div>}
      {events.length === 0 ? <p className="mt-3 text-sm">No audit events found for this request.</p> : <div className="mt-3 space-y-2">
        {events.map((event) => <div key={event.id} className="rounded-xl border border-[var(--color-border)] p-3 text-sm">
          <div className="font-semibold break-all">{event.action.replaceAll("_", " ")}</div>
          {event.dataQuality === "review_required" && <p className="mt-1 text-xs font-semibold text-[var(--danger-color)]">Audit record data needs review: {event.qualityIssues.join(", ").replaceAll("_", " ")}</p>}
          <div className="mt-1 text-xs text-[var(--text-secondary)]">{event.createdAt ? new Date(event.createdAt).toLocaleString() : "Timestamp unavailable"} · Admin: {event.adminId || "Unavailable"}</div>
          {event.orderId && <div className="mt-1 text-xs break-all">Order ID: {event.orderId}</div>}
          {event.refundId && <div className="text-xs break-all">Provider refund ID: {event.refundId}</div>}
          {event.providerStatus && <div className="mt-1">Provider status: {event.providerStatus}</div>}
          {event.committedStatus && <div>Committed status: {event.committedStatus} / {event.committedExecutionStatus || "—"}</div>}
          {event.amount !== null && <div>Amount: ₹{event.amount.toFixed(2)}</div>}
          {event.amountPaise !== null && <div className="text-xs text-[var(--text-secondary)]">Recorded minor units: {event.amountPaise} paise</div>}
          {event.errorCode && <div className="font-semibold">Error category: {event.errorCode}</div>}
          {event.reservationReleased !== null && <div>Reservation released: {event.reservationReleased ? "Yes" : "No"}</div>}
        </div>)}
      </div>}
      {hasMore && <button disabled={loading} onClick={onLoadMore} className="mt-3 rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-bold disabled:opacity-50">
        {loading ? "Loading..." : "Load older events"}
      </button>}
    </section>
  );
}

function ReconciliationPanel({ data }: { data: Reconciliation }) {
  const money = (paise: number | null) => paise === null ? "Unavailable" : `₹${(paise / 100).toFixed(2)}`;
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--card-color)] p-4" aria-live="polite">
      <div className="flex items-center gap-2 font-bold">{data.manualReviewRequired ? <ShieldAlert size={20} /> : <CheckCircle2 size={20} />}
        {data.manualReviewRequired ? "Manual review required" : "Provider and local records matched"}
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Paid amount" value={money(data.paidAmountPaise)} />
        <Metric label="Provider total" value={money(data.providerTotalAmountPaise)} />
        <Metric label="Committed refunds" value={money(data.providerCommittedAmountPaise)} />
        <Metric label="Remaining capacity" value={money(data.remainingCommittedCapacityPaise)} />
        <Metric label="Provider refund count" value={data.providerRefundCount === null ? "Unavailable" : String(data.providerRefundCount)} />
        <Metric label="Malformed rows" value={String(data.malformedProviderRows ?? 0)} />
        <Metric label="Unknown statuses" value={String(data.unknownProviderStatuses ?? 0)} />
        <Metric label="Duplicate local requests" value={String(data.duplicateLocalRequestCount ?? 0)} />
        <Metric label="Duplicate local refund IDs" value={String(data.duplicateLocalRefundIds?.length ?? 0)} />
        <Metric label="Local history complete" value={data.localHistoryTruncated ? "No — manual review" : "Yes"} />
        <Metric label="Over-refunded" value={data.overRefunded ? "Yes" : "No"} />
      </div>
      <div className="mt-4 space-y-2">
        <h4 className="font-bold">Refund matches</h4>
        {(data.matches || []).map((item) => <div key={item.requestId} className="rounded-xl border border-[var(--color-border)] p-3 text-xs">
          <div className="break-all font-semibold">{item.requestId} · {item.refundId}</div>
          <div className="mt-1">Local {money(item.amountPaise)} · Provider {money(item.providerAmountPaise)} · {item.providerStatus || "Not found"}</div>
          <div className="mt-1 font-bold">{item.match.replaceAll("_", " ")}</div>
        </div>)}
        {(data.unmatchedProviderRefundIds || []).length > 0 && <p className="break-words text-xs">Unmatched provider refund IDs: {data.unmatchedProviderRefundIds?.join(", ")}</p>}
        {(data.unmatchedLocalRequestIds || []).length > 0 && <p className="break-words text-xs">Local requests missing from provider: {data.unmatchedLocalRequestIds?.join(", ")}</p>}
        {(data.duplicateLocalRefundIds || []).length > 0 && <p className="break-words text-xs">Duplicate local refund IDs: {data.duplicateLocalRefundIds?.join(", ")}</p>}
      </div>
      {data.localHistoryTruncated && <p className="mt-3 rounded-xl border border-[var(--color-border)] p-3 text-sm font-semibold">More than {data.localHistoryLimit ?? 500} local requests exist for this order. The reconciliation result is incomplete; manual review is required.</p>}
      <p className="mt-3 text-xs text-[var(--text-secondary)]">Read-only report. This screen does not submit refunds or release reservations.</p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-[var(--color-border)] p-3"><div className="text-xs text-[var(--text-secondary)]">{label}</div><div className="mt-1 font-bold">{value}</div></div>;
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const approved = ["approved_pending_refund", "refund_processing", "refund_retry_required", "refund_submitted"].includes(normalized);
  const successful = normalized === "refunded";
  const rejected = ["rejected", "refund_failed"].includes(normalized);
  const manualReview = normalized === "refund_manual_review_required";
  const color = successful ? "bg-[var(--success-color)]" : rejected ? "bg-[var(--danger-color)]" : "bg-[var(--warning-color)]";
  const label = normalized === "approved_pending_refund" ? "Approved — Awaiting Processing" : normalized === "refund_submitted" ? "Refund Submitted — Awaiting Bank" : normalized === "refund_processing" ? "Refund Processing" : normalized === "refund_retry_required" ? "Refund Retry Required" : normalized === "refunded" ? "Refund Successful" : status;
  const displayLabel = manualReview ? "Manual Review Required" : label;
  return <div className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold ${color}`}>{approved ? <CheckCircle2 size={16} /> : rejected ? <XCircle size={16} /> : <Clock3 size={16} />}{displayLabel}</div>;
}
