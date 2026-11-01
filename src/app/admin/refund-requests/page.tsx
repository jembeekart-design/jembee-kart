"use client";

import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { RefreshCcw, User, Package, IndianRupee, CheckCircle2, XCircle, Clock3 } from "lucide-react";
import { auth } from "@/firebase/config";

interface RefundRequest {
  id: string;
  userName: string;
  productName: string;
  amount: number;
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
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error(result.message || "Could not load refund requests");
      setRequests(Array.isArray(result.requests) ? result.requests : []);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load refund requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) void loadRequests();
      else {
        setRequests([]);
        setMessage("Please sign in with an admin account.");
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [loadRequests]);

  async function updateStatus(id: string, action: "approve" | "reject" | "process" | "refresh") {
    const user = auth.currentUser;
    if (!user) {
      setMessage("Please sign in again.");
      return;
    }
    setBusyId(id);
    setMessage("");
    try {
      const token = await user.getIdToken();
      const endpoint = action === "process" || action === "refresh" ? "/api/admin/refund-requests/process" : "/api/admin/refund-requests";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id, action }),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error(result.message || "Refund request could not be updated");
      setMessage(result.message || "Refund request updated.");
      await loadRequests();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Refund request could not be updated");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[var(--card-color)] text-[var(--button-text-color)]">Loading Refund Requests...</div>;
  }

  return (
    <main className="min-h-screen bg-[var(--color-page-background)] p-4 text-[var(--button-text-color)]">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--primary-color)]"><RefreshCcw size={30} /></div>
        <div>
          <h1 className="text-3xl font-black">Refund Requests</h1>
          <p className="mt-1 text-sm text-[var(--muted-text-color)]">Review customer refund requests</p>
        </div>
      </div>

      <p className="mb-5 rounded-xl border border-[var(--color-border)] bg-[var(--card-color)] p-4 text-sm text-[var(--text-secondary)]">Approval does not mean money has been returned. Automatic processing is available only for verified Cashfree-paid orders. COD/manual bank refunds require a separately verified payout workflow. Refresh provider status before treating a submitted refund as complete.</p>
      {message && <p role="status" className="mb-5 rounded-xl bg-[var(--card-color)] p-4">{message}</p>}

      <div className="space-y-5">
        {requests.length === 0 && <div className="rounded-[30px] bg-[var(--primary-color)] p-10 text-center">No Refund Requests Found</div>}
        {requests.map((request) => {
          const pending = ["pending", "requested"].includes(request.status.toLowerCase());
          return (
            <div key={request.id} className="rounded-[30px] bg-[var(--primary-color)] p-5">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-3"><User size={20} /><h2 className="text-2xl font-black">{request.userName}</h2></div>
                    <div className="mt-4 flex flex-col gap-2 text-[var(--text-color)]">
                      <div className="flex items-center gap-2"><Package size={16} />{request.productName}</div>
                      <div className="flex items-center gap-2"><IndianRupee size={16} />{request.amount.toFixed(2)}</div>
                      {request.orderId && <div className="text-sm">Order: {request.orderId}</div>}
                    </div>
                  </div>
                  <div className="space-y-2">
                  <StatusBadge status={request.status} />
                  {request.providerRefundStatus && <p className="text-xs text-[var(--text-secondary)]">Cashfree: {request.providerRefundStatus}</p>}
                  {request.refundArn && <p className="text-xs break-all text-[var(--text-secondary)]">ARN: {request.refundArn}</p>}
                </div>
                </div>
                <div className="rounded-2xl bg-[var(--card-color)]/30 p-4">
                  <h3 className="mb-2 font-bold">Refund Reason</h3>
                  <p className="whitespace-pre-wrap break-words text-[var(--text-color)]">{request.reason}</p>
                </div>
                {pending && <div className="flex flex-wrap gap-3">
                  <button disabled={busyId === request.id} onClick={() => void updateStatus(request.id, "approve")} className="flex items-center gap-2 rounded-2xl bg-[var(--success-color)] px-5 py-3 font-bold text-[var(--text-color)] disabled:opacity-50">
                    <CheckCircle2 size={18} /> Approve for processing
                  </button>
                  <button disabled={busyId === request.id} onClick={() => void updateStatus(request.id, "reject")} className="flex items-center gap-2 rounded-2xl bg-[var(--danger-color)] px-5 py-3 font-bold disabled:opacity-50">
                    <XCircle size={18} /> Reject
                  </button>
                </div>}
                {["approved_pending_refund", "refund_retry_required", "refund_processing"].includes(request.status.toLowerCase()) && <button disabled={busyId === request.id} onClick={() => void updateStatus(request.id, "process")} className="rounded-2xl bg-[var(--success-color)] px-5 py-3 font-bold disabled:opacity-50">Process Refund (Cashfree only)</button>}
                {["refund_submitted", "refunded", "refund_failed"].includes(request.status.toLowerCase()) && <button disabled={busyId === request.id} onClick={() => void updateStatus(request.id, "refresh")} className="rounded-2xl border border-[var(--color-border)] px-5 py-3 font-bold disabled:opacity-50">Refresh Cashfree Status</button>}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const approved = ["approved_pending_refund", "refund_processing", "refund_retry_required", "refund_submitted"].includes(normalized);
  const successful = normalized === "refunded";
  const rejected = ["rejected", "refund_failed"].includes(normalized);
  const color = successful ? "bg-[var(--success-color)]" : approved ? "bg-[var(--warning-color)]" : rejected ? "bg-[var(--danger-color)]" : "bg-[var(--warning-color)]";
  const label = normalized === "approved_pending_refund" ? "Approved — Awaiting Processing" : normalized === "refund_submitted" ? "Refund Submitted — Awaiting Bank" : normalized === "refund_processing" ? "Refund Processing" : normalized === "refund_retry_required" ? "Refund Retry Required" : normalized === "refunded" ? "Refund Successful" : status;
  return <div className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold ${color}`}>{approved ? <CheckCircle2 size={16} /> : rejected ? <XCircle size={16} /> : <Clock3 size={16} />}{label}</div>;
}
