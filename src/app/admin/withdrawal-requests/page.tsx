"use client";

import { useCallback, useEffect, useState } from "react";
import { Wallet, IndianRupee, User, CheckCircle2, XCircle, Clock3, RefreshCw } from "lucide-react";
import { auth } from "@/firebase/config";

interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  fee: number;
  payoutAmount: number;
  method: string;
  account: string;
  status: string;
  createdAt: string | null;
}

export default function WithdrawalRequestsPage() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Admin login required");
    const token = await user.getIdToken();
    const all: WithdrawalRequest[] = [];
    let cursor = "";
    let hasMore = false;
    for (let page = 0; page < 20; page++) {
      const url = cursor ? `/api/admin/withdrawal-requests?cursor=${encodeURIComponent(cursor)}` : "/api/admin/withdrawal-requests";
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const data = await response.json();
      if (!response.ok || data.success !== true) throw new Error(data.message || "Unable to load withdrawals");
      all.push(...(Array.isArray(data.requests) ? data.requests : []));
      cursor = typeof data.nextCursor === "string" ? data.nextCursor : "";
      hasMore = data.hasMore === true && !!cursor;
      if (!hasMore) break;
    }
    setRequests(all);
    if (hasMore) setMessage("Showing first 2,000 pending requests; more remain.");
  }, []);

  useEffect(() => {
    loadRequests().catch((err) => setError(err instanceof Error ? err.message : "Unable to load withdrawals")).finally(() => setLoading(false));
  }, [loadRequests]);

  async function processRequest(item: WithdrawalRequest, action: "approve" | "reject") {
    const payoutReference = action === "approve" ? window.prompt("Enter the verified bank/UPI transaction reference. Do not approve until payment has actually been sent.")?.trim() || "" : "";
    const reason = action === "reject" ? window.prompt("Enter the reason for rejecting this withdrawal.")?.trim() || "" : "";
    if (action === "approve" && payoutReference.length < 6) return;
    if (action === "reject" && reason.length < 3) return;
    setProcessingId(item.id);
    setError("");
    setMessage("");
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Admin login required");
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/withdrawal-requests", {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawId: item.id, action, payoutReference, reason }),
      });
      const data = await response.json();
      if (!response.ok || data.success !== true) throw new Error(data.message || "Withdrawal update failed");
      setRequests((current) => current.filter((request) => request.id !== item.id));
      setMessage(action === "approve" ? "Withdrawal marked paid and ledger updated." : "Withdrawal rejected and amount returned to wallet.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdrawal update failed");
    } finally { setProcessingId(null); }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading withdrawals…</div>;

  return (
    <main className="min-h-screen bg-[var(--color-page-background)] p-4 text-[var(--button-text-color)]">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--success-color)]"><Wallet size={30} /></div>
          <div><h1 className="text-3xl font-black">Withdrawal Requests</h1><p className="text-sm text-[var(--muted-text-color)]">Pending requests from real user wallets</p></div>
        </div>
        <button onClick={() => loadRequests().catch((err) => setError(err instanceof Error ? err.message : "Refresh failed"))} className="flex items-center gap-2 rounded-xl bg-[var(--color-card-background)] px-4 py-3"><RefreshCw size={16} /> Refresh</button>
      </div>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-100 p-3 text-red-700">{error}</p>}
      {message && <p role="status" className="mb-4 rounded-xl bg-green-100 p-3 text-green-800">{message}</p>}
      <div className="space-y-4">
        {requests.length === 0 ? <div className="rounded-2xl bg-[var(--color-card-background)] p-8 text-center">No pending withdrawal requests.</div> : requests.map((item) => (
          <div key={item.id} className="rounded-2xl bg-[var(--color-card-background)] p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="flex items-center gap-2 font-bold"><User size={16} /> {item.userName}</p>
                <p className="text-xs text-[var(--text-secondary)]">User ID: {item.userId}</p>
                <p className="text-xs text-[var(--text-secondary)]">UPI: {item.account || "Not supplied"}</p>
                <p className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><Clock3 size={14} /> {item.createdAt ? new Date(item.createdAt).toLocaleString() : "Date unavailable"}</p>
              </div>
              <div className="text-right"><p className="flex items-center justify-end gap-1 text-2xl font-black"><IndianRupee size={20} />{item.amount.toLocaleString("en-IN")}</p><p className="text-xs capitalize text-[var(--text-secondary)]">{item.method} · Fee ₹{item.fee.toFixed(2)} · Pay ₹{item.payoutAmount.toFixed(2)}</p></div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button disabled={processingId === item.id} onClick={() => processRequest(item, "approve")} className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 font-bold text-white disabled:opacity-50"><CheckCircle2 size={16} /> Mark Paid</button>
              <button disabled={processingId === item.id} onClick={() => processRequest(item, "reject")} className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-bold text-white disabled:opacity-50"><XCircle size={16} /> Reject & Refund</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
