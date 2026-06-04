"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, orderBy, Timestamp } from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import { ArrowLeft, Loader2, ArrowUpRight, ArrowDownLeft } from "lucide-react";

const VALID_TRANSACTION_TYPES = [
  "cashback",
  "reward",
  "refund",
  "bonus",
  "cashback_transfer",
  "withdrawal",
  "commission"
] as const;
type AllowedTransactionType = typeof VALID_TRANSACTION_TYPES[number];

const VALID_STATUS_TYPES = ["success", "pending", "failed"] as const;
type AllowedStatusType = typeof VALID_STATUS_TYPES[number];

interface WalletTxItem {
  id: string;
  transactionId: string;
  userId: string;
  title: string;
  amount: number;
  type: AllowedTransactionType;
  status: AllowedStatusType;
  walletType: string;
  destinationWallet: string;
  beforeWalletBalance: number;
  afterWalletBalance: number;
  createdAt?: Timestamp;
}

export default function WalletHistoryPage() {
  const [history, setHistory] = useState<WalletTxItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let unsubscribeTx: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const txRef = collection(db, "users", user.uid, "walletTransactions");
      const q = query(txRef, orderBy("createdAt", "desc"));

      unsubscribeTx = onSnapshot(q, (snapshot) => {
        const list: WalletTxItem[] = snapshot.docs.map((doc) => {
          const d = doc.data();
          
          const rawTypeStr = String(d.type || "");
          const assertedType: AllowedTransactionType = 
            VALID_TRANSACTION_TYPES.includes(rawTypeStr as AllowedTransactionType)
              ? (rawTypeStr as AllowedTransactionType)
              : "cashback";

          const rawStatusStr = String(d.status || "");
          const assertedStatus: AllowedStatusType = 
            VALID_STATUS_TYPES.includes(rawStatusStr as AllowedStatusType)
              ? (rawStatusStr as AllowedStatusType)
              : "success";

          // Issue #3 Fix: Absolute programmatic safety layers applied to nested fields mutations trackers
          return {
            id: doc.id,
            transactionId: d.transactionId || doc.id, 
            userId: d.userId || user.uid,             
            title: d.title || "Wallet Log Operational Entry",
            amount: typeof d.amount === "number" ? d.amount : 0,
            type: assertedType,
            status: assertedStatus,
            walletType: d.walletType || "Main",
            destinationWallet: d.destinationWallet || "Main",
            beforeWalletBalance: typeof d.beforeWalletBalance === "number" ? d.beforeWalletBalance : 0,
            afterWalletBalance: typeof d.afterWalletBalance === "number" ? d.afterWalletBalance : 0,
            createdAt: d.createdAt,
          };
        });
        setHistory(list);
        setLoading(false);
      }, (error) => {
        console.error("Historical balances snapshot fault:", error);
        setLoading(false); 
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeTx) unsubscribeTx();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-slate-800" size={26} />
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Compiling ledger state indexes...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      <div className="sticky top-0 z-50 bg-white px-4 py-4 border-b border-slate-100 flex items-center gap-3">
        <Link href="/dashboard/cashback" className="h-9 w-9 bg-slate-100 flex items-center justify-center rounded-full text-slate-700 active:scale-90 transition-transform">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-lg font-black text-slate-800 tracking-tight">Wallet Transactions History</h1>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Internal Accounting Ledger Node</p>
        </div>
      </div>

      <div className="p-4 space-y-2.5">
        {history.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-3xl border border-slate-100 text-slate-400 text-xs font-medium tracking-tight">
            No balancing ledger entry movements captured in track loops yet.
          </div>
        ) : (
          history.map((tx) => (
            <div key={tx.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3 animate-in fade-in-40 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-full bg-slate-50 flex items-center justify-center">
                    {tx.type === "cashback_transfer" ? <ArrowUpRight className="text-emerald-600" size={16} /> : <ArrowDownLeft className="text-amber-600" size={16} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 leading-tight">{tx.title}</h4>
                    <p className="text-[9px] font-mono text-slate-400 mt-0.5">UID Map: {tx.userId.slice(0, 8)}... | Ledger Token ID: {tx.transactionId.slice(0, 8)}...</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-800">₹{tx.amount}</p>
                  <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase font-bold tracking-tight">{tx.status}</span>
                </div>
              </div>
              
              <div className="pt-2.5 border-t border-slate-50 grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-semibold">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Allocation Channel Path</p>
                  <p className="text-slate-700 font-black mt-0.5">{tx.walletType} ➔ {tx.destinationWallet}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">System Modification Checks Balance</p>
                  <p className="font-mono text-slate-700 font-black mt-0.5">₹{tx.beforeWalletBalance} ➔ ₹{tx.afterWalletBalance}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
