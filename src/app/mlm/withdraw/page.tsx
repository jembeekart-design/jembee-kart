"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeIndianRupee, Building2, Clock3, Wallet } from "lucide-react";
import { auth } from "@/firebase/config";

interface WithdrawalItem {
  id: string;
  amount: number;
  status: string;
  createdAt: string | null;
  adminRemark: string;
  fee: number;
  payoutAmount: number;
}

interface WithdrawalSummary {
  walletBalance: number;
  pendingWithdrawal: number;
  kycVerified: boolean;
  isBlocked: boolean;
  walletEnabled: boolean;
  minimumWithdrawal: number;
  withdrawalCharge: number;
  withdrawalChargeType: "FIXED" | "PERCENTAGE";
  maxDailyWithdrawal: number;
  kycRequired: boolean;
  history: WithdrawalItem[];
}

export default function WithdrawPage() {
  const [amount, setAmount] = useState("");
  const [upi, setUpi] = useState("");
  const [summary, setSummary] = useState<WithdrawalSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadSummary = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Please sign in to view your wallet.");
    const token = await user.getIdToken();
    const response = await fetch("/api/wallet/withdrawals", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    const data = await response.json();
    if (!response.ok || data.success !== true) throw new Error(data.message || "Unable to load withdrawal information.");
    setSummary(data as WithdrawalSummary);
  }, []);

  useEffect(() => {
    loadSummary().catch((err) => setError(err instanceof Error ? err.message : "Unable to load wallet."))
      .finally(() => setLoading(false));
  }, [loadSummary]);

  async function requestWithdrawal() {
    setError("");
    setMessage("");
    const requestedAmount = Number(amount);
    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0 || !upi.trim()) {
      setError("Enter a valid withdrawal amount and UPI ID.");
      return;
    }
    setSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Please sign in again.");
      const token = await user.getIdToken();
      const response = await fetch("/api/wallet/withdrawals", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ amount: requestedAmount, upi: upi.trim(), requestId: crypto.randomUUID() }),
      });
      const data = await response.json();
      if (!response.ok || data.success !== true) throw new Error(data.message || "Withdrawal request failed.");
      setMessage(data.message || "Withdrawal request submitted.");
      setAmount("");
      setUpi("");
      await loadSummary();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdrawal request failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <main className="flex min-h-screen items-center justify-center">Loading wallet…</main>;
  const previewAmount = Number(amount);
  const previewFee = summary && Number.isFinite(previewAmount) && previewAmount > 0
    ? Math.round((summary.withdrawalChargeType === "PERCENTAGE" ? previewAmount * summary.withdrawalCharge / 100 : summary.withdrawalCharge) * 100) / 100
    : 0;
  const previewPayout = Math.max(0, Math.round((previewAmount - previewFee) * 100) / 100);

  return (
    <main className="min-h-screen bg-[var(--color-page-background)] pb-24">
      <div className="sticky top-0 z-50 bg-[var(--color-card-background)] px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/mlm/dashboard" className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-button)] text-[var(--button-text-color)]"><ArrowLeft size={20} /></Link>
          <div><h1 className="text-2xl font-black text-[var(--color-primary-button)]">Withdraw</h1><p className="text-[11px] text-[var(--text-secondary)]">Withdraw MLM Earnings</p></div>
        </div>
      </div>

      <section className="px-4 pt-5">
        <div className="rounded-[30px] bg-[var(--color-primary-button)] p-5 text-[var(--button-text-color)] shadow-xl">
          <Wallet size={40} />
          <p className="mt-5 text-[13px] opacity-80">Available Balance</p>
          <h2 className="mt-2 text-[38px] font-black">₹{(summary?.walletBalance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          <p className="mt-2 text-[12px] opacity-85">Pending withdrawal: ₹{(summary?.pendingWithdrawal ?? 0).toLocaleString("en-IN")}</p>
        </div>
      </section>

      <section className="mt-6 px-4">
        <div className="rounded-[28px] bg-[var(--color-card-background)] p-5 shadow-sm">
          <h2 className="text-[22px] font-black">Withdraw Request</h2>
          {summary && !summary.walletEnabled && <p className="mt-3 rounded-xl bg-amber-100 p-3 text-sm text-amber-800">Wallet withdrawals are temporarily disabled by the administrator.</p>}
          {summary?.isBlocked && <p className="mt-3 rounded-xl bg-red-100 p-3 text-sm text-red-700">Your account is blocked. Withdrawal is unavailable.</p>}
          {summary?.kycRequired && !summary.kycVerified && <p className="mt-3 rounded-xl bg-amber-100 p-3 text-sm text-amber-800">Complete KYC before requesting a withdrawal.</p>}
          {summary && summary.pendingWithdrawal > 0 && <p className="mt-3 rounded-xl bg-amber-100 p-3 text-sm text-amber-800">You already have a pending withdrawal request.</p>}

          <div className="mt-5">
            <label className="text-[13px] font-black">Withdraw Amount</label>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-page-background)] px-4 py-3">
              <BadgeIndianRupee size={18} className="text-[var(--color-primary-button)]" />
              <input type="number" min={summary?.minimumWithdrawal ?? 1} step="0.01" placeholder={`Minimum ₹${summary?.minimumWithdrawal ?? 200}`} value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-transparent text-sm outline-none" />
            </div>
          </div>
          <div className="mt-5">
            <label className="text-[13px] font-black">UPI ID</label>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-page-background)] px-4 py-3">
              <Building2 size={18} className="text-[var(--color-primary-button)]" />
              <input type="text" autoComplete="off" placeholder="example@upi" value={upi} onChange={(e) => setUpi(e.target.value)} className="w-full bg-transparent text-sm outline-none" />
            </div>
          </div>

          {error && <p role="alert" className="mt-4 rounded-xl bg-red-100 p-3 text-sm text-red-700">{error}</p>}
          {message && <p role="status" className="mt-4 rounded-xl bg-green-100 p-3 text-sm text-green-800">{message}</p>}
          {Number.isFinite(previewAmount) && previewAmount > 0 && <p className="mt-3 text-sm text-[var(--text-secondary)]">Estimated fee: ₹{previewFee.toFixed(2)} · You receive: ₹{previewPayout.toFixed(2)}</p>}
          <button onClick={requestWithdrawal} disabled={submitting || !summary || !summary.walletEnabled || summary.isBlocked || (summary.kycRequired && !summary.kycVerified) || summary.pendingWithdrawal > 0} className="mt-7 w-full rounded-2xl bg-[var(--color-primary-button)] py-3 text-[15px] font-black text-[var(--button-text-color)] shadow-lg disabled:cursor-not-allowed disabled:opacity-50">
            {submitting ? "Processing…" : "Withdraw Now"}
          </button>
          <p className="mt-3 text-xs text-[var(--text-secondary)]">Minimum withdrawal ₹{summary?.minimumWithdrawal ?? 200}. Daily request limit: {summary?.maxDailyWithdrawal ?? 3}.</p>
        </div>
      </section>

      <section className="mt-6 px-4">
        <div className="rounded-[28px] bg-[var(--color-card-background)] p-5 shadow-sm">
          <h2 className="text-[22px] font-black">Withdraw History</h2>
          <div className="mt-5 space-y-3">
            {!summary?.history.length ? <p className="text-sm text-[var(--text-secondary)]">No withdrawal requests yet.</p> : summary.history.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--color-page-background)] p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-warning)]"><Clock3 size={20} /></div>
                  <div className="min-w-0">
                    <h3 className="font-black">₹{item.amount.toLocaleString("en-IN")} requested</h3>
                    <p className="text-xs text-[var(--text-secondary)]">Fee ₹{Number(item.fee || 0).toFixed(2)} · Payout ₹{Number(item.payoutAmount ?? item.amount).toFixed(2)}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{item.createdAt ? new Date(item.createdAt).toLocaleString() : "Date unavailable"}</p>
                    {item.adminRemark && <p className="break-words text-xs text-[var(--text-secondary)]">{item.adminRemark}</p>}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-[var(--color-card-background)] px-3 py-1 text-xs font-bold capitalize">{item.status.replaceAll("_", " ")}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
