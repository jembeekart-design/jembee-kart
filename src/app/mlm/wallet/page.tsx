"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, BadgeIndianRupee, Gift, Wallet, History, AlertCircle, Loader2 } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";

type WalletTransaction = {
  id: string;
  title: string;
  amount: number;
  type: string;
  status: string;
  walletType: string;
  createdAt?: string | null;
  direction?: "credit" | "debit" | "unknown";
};

export default function MLMWalletPage() {
  const { wallet, loading: walletLoading, error: walletError } = useWallet();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (active) {
          setTransactions([]);
          setHistoryError("Sign in to view your wallet transactions.");
          setHistoryLoading(false);
        }
        return;
      }
      if (active) { setHistoryLoading(true); setHistoryError(""); }
      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/wallet/history", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const payload = await response.json();
        if (!response.ok || payload.success !== true || !Array.isArray(payload.history)) {
          throw new Error(payload.message || "Wallet transactions are temporarily unavailable.");
        }
        if (active) setTransactions(payload.history.slice(0, 5));
      } catch (error) {
        if (active) {
          setTransactions([]);
          setHistoryError(error instanceof Error ? error.message : "Wallet transactions are temporarily unavailable.");
        }
      } finally {
        if (active) setHistoryLoading(false);
      }
    });
    return () => { active = false; unsubscribe(); };
  }, []);

  const money = (value: unknown) => {
    const amount = Number(value);
    return Number.isFinite(amount) ? amount.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "0";
  };
  const dateLabel = (value?: string | null) => {
    if (!value) return "Date unavailable";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  };

  if (walletLoading) return <main className="flex min-h-screen items-center justify-center bg-[var(--color-page-background)] text-[var(--text-primary)]"><Loader2 className="animate-spin" /> <span className="ml-2">Loading wallet…</span></main>;

  return (
    <main className="min-h-screen bg-[var(--color-page-background)] pb-12">
      <header className="sticky top-0 z-50 bg-[var(--color-card-background)] px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/mlm/dashboard" aria-label="Back to MLM dashboard" className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-button)] text-[var(--button-text-color)]"><ArrowLeft size={20} /></Link>
          <div><h1 className="text-2xl font-black text-[var(--text-primary)]">MLM Wallet</h1><p className="text-[11px] text-[var(--text-secondary)]">Balances from your account record</p></div>
        </div>
      </header>

      <section className="px-4 pt-5">
        {walletError && <p role="alert" className="mb-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-background)] p-3 text-sm text-[var(--text-secondary)]">{walletError}</p>}
        <div className="rounded-[28px] bg-[var(--color-primary-button)] p-5 text-[var(--button-text-color)] shadow-xl">
          <Wallet size={34} />
          <p className="mt-5 text-sm opacity-85">Wallet Balance</p>
          <h2 className="mt-2 text-4xl font-black">{walletError ? "Unavailable" : wallet ? `₹${money(wallet.walletBalance)}` : "—"}</h2>
          <p className="mt-2 text-xs opacity-85">{walletError ? "Balance unavailable until the account record can be verified." : wallet ? "Current balance reported by your account wallet record." : "No wallet record is available for this account."}</p>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3 px-4">
        <div className="rounded-2xl bg-[var(--color-card-background)] p-4"><BadgeIndianRupee size={26} className="text-[var(--color-success)]"/><p className="mt-3 text-2xl font-black text-[var(--text-primary)]">₹{money(wallet?.commissionWallet)}</p><p className="text-xs text-[var(--text-secondary)]">Commission Wallet</p></div>
        <div className="rounded-2xl bg-[var(--color-card-background)] p-4"><Gift size={26} className="text-[var(--color-primary-button)]"/><p className="mt-3 text-2xl font-black text-[var(--text-primary)]">₹{money(wallet?.rewardWallet)}</p><p className="text-xs text-[var(--text-secondary)]">Reward Wallet</p></div>
        <div className="col-span-2 rounded-2xl bg-[var(--color-card-background)] p-4"><Gift size={26} className="text-[var(--color-warning)]"/><p className="mt-3 text-2xl font-black text-[var(--text-primary)]">₹{money(wallet?.cashbackWallet)}</p><p className="text-xs text-[var(--text-secondary)]">Cashback Wallet</p></div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3 px-4">
        <Link href="/mlm/withdraw" className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary-button)] py-4 text-sm font-black text-[var(--button-text-color)]"><ArrowDownLeft size={19}/> Withdraw</Link>
        <div aria-disabled="true" className="flex cursor-not-allowed items-center justify-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-background)] py-4 text-sm font-bold text-[var(--text-secondary)]"><ArrowUpRight size={19}/> Transfer unavailable</div>
      </section>
      <p className="mx-4 mt-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-background)] p-3 text-xs text-[var(--text-secondary)]">Wallet transfer is not enabled because a verified transfer workflow is not available. No transfer will be simulated.</p>

      <section className="mt-6 px-4">
        <div className="rounded-[26px] bg-[var(--color-card-background)] p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2"><h2 className="text-xl font-black text-[var(--text-primary)]">Recent Transactions</h2><Link href="/mlm/wallet/history" className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary-button)]"><History size={14}/> Full ledger</Link></div>
          {historyLoading ? <p className="mt-4 text-sm text-[var(--text-secondary)]">Loading verified transaction history…</p> : historyError ? <p role="alert" className="mt-4 flex gap-2 rounded-xl border border-[var(--color-border)] p-3 text-sm text-[var(--text-secondary)]"><AlertCircle size={18} className="shrink-0"/>{historyError}</p> : transactions.length === 0 ? <p className="mt-4 text-sm text-[var(--text-secondary)]">No transaction records are available yet.</p> : <div className="mt-4 space-y-3">{transactions.map((tx) => <div key={tx.id} className="flex items-center justify-between gap-3 rounded-xl bg-[var(--color-page-background)] p-3"><div className="min-w-0"><p className="truncate text-sm font-bold text-[var(--text-primary)]">{tx.title || "Wallet transaction"}</p><p className="mt-1 text-xs text-[var(--text-secondary)]">{tx.walletType} · {dateLabel(tx.createdAt)}</p><p className="text-[11px] capitalize text-[var(--text-secondary)]">{tx.status}</p></div><p className={`shrink-0 text-sm font-black ${tx.direction === "credit" ? "text-[var(--color-success)]" : tx.direction === "debit" ? "text-[var(--color-danger)]" : "text-[var(--text-primary)]"}`}>{tx.direction === "credit" ? "+" : tx.direction === "debit" ? "−" : ""}₹{money(tx.amount)}</p></div>)}</div>}
        </div>
      </section>
    </main>
  );
}
