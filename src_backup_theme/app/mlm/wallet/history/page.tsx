"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, orderBy, Timestamp } from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import { ArrowLeft, Loader2, ArrowUpRight, ArrowDownLeft, AlertCircle } from "lucide-react";

const VALID_TRANSACTION_TYPES = [
  "cashback",
  "directIncome",
  "levelIncome",
  "rankIncome",
  "watchReward",
  "creatorIncome",
  "withdrawal",
  "cashback_transfer"
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
  destinationWallet?: string;
  beforeWalletBalance?: number;
  afterWalletBalance?: number;
  createdAt?: Timestamp;
}

export default function WalletHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<WalletTxItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let unsubscribeTx: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeTx) {
        unsubscribeTx();
        unsubscribeTx = null;
      }

      if (!user) {
        setHistory([]);
        setLoading(false);
        return;
      }

      try {
        const txRef = collection(db, "users", user.uid, "walletTransactions");
        const q = query(txRef, orderBy("createdAt", "desc"));

        unsubscribeTx = onSnapshot(q, (snapshot) => {
          const list: WalletTxItem[] = snapshot.docs.map((doc) => {
            const d = doc.data();
            
            const rawTypeStr = String(d.type || "");
            
            // Fix 1: Unknown transaction type fallback to "directIncome"
            const assertedType: AllowedTransactionType = 
              VALID_TRANSACTION_TYPES.includes(rawTypeStr as AllowedTransactionType)
                ? (rawTypeStr as AllowedTransactionType)
                : "directIncome";

            const rawStatusStr = String(d.status || "");
            const assertedStatus: AllowedStatusType = 
              VALID_STATUS_TYPES.includes(rawStatusStr as AllowedStatusType)
                ? (rawStatusStr as AllowedStatusType)
                : "success";

            return {
              id: doc.id,
              transactionId: d.transactionId || doc.id, 
              userId: d.userId || user.uid,             
              title: d.title || "Income Distribution Log",
              amount: typeof d.amount === "number" ? d.amount : 0,
              type: assertedType,
              status: assertedStatus,
              walletType: d.walletType || "Credit Wallet",
              destinationWallet: d.destinationWallet,
              beforeWalletBalance: typeof d.beforeWalletBalance === "number" ? d.beforeWalletBalance : undefined,
              afterWalletBalance: typeof d.afterWalletBalance === "number" ? d.afterWalletBalance : undefined,
              createdAt: d.createdAt,
            };
          });
          
          setHistory(list);
          setLoading(false);
        }, (error) => {
          console.error("Ledger Node Snapshot Pipeline Fault:", error);
          setLoading(false); 
        });
      } catch (err) {
        console.error("Subscription process failure:", err);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeTx) unsubscribeTx();
    };
  }, []);

  const formatTxTypeLabel = (type: AllowedTransactionType): string => {
    const labels: Record<AllowedTransactionType, string> = {
      cashback: "Cashback Reward",
      directIncome: "Direct Referral Income",
      levelIncome: "Level Generation Income",
      rankIncome: "Rank Royalty Income",
      watchReward: "Watch & Earn Reward",
      creatorIncome: "Creator Pool Income",
      withdrawal: "Wallet Withdrawal",
      cashback_transfer: "Internal Node Transfer"
    };
    return labels[type] || type;
  };

  // Fix 3: Strict Firestore timestamp conversion safety check
  const formatTxDate = (timestamp?: Timestamp) => {
    if (!timestamp || typeof (timestamp as any).toDate !== "function") {
      return "Syncing Ledger...";
    }

    return timestamp.toDate().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-slate-800" size={24} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling MLM Ledger State...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-12 antialiased">
      <div className="sticky top-0 z-50 bg-white px-4 py-4 border-b border-slate-100 flex items-center gap-3 dashboard-nav-blur">
        <button 
          onClick={() => router.push("/mlm/wallet")} 
          className="h-9 w-9 bg-slate-100 flex items-center justify-center rounded-full text-slate-700 active:scale-95 transition-transform"
          aria-label="Back to account dashboard"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-base font-black text-slate-800 tracking-tight">Ledger Statement</h1>
          <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Internal Accounting Node</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {history.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 text-slate-400 text-xs font-medium px-6 shadow-sm">
            <AlertCircle className="mx-auto text-slate-300 mb-2" size={20} />
            No transaction records or income distributions mapped to this node yet.
          </div>
        ) : (
          history.map((tx) => {
            const isDebitFlow = ["withdrawal", "cashback_transfer"].includes(tx.type);

            return (
              <div key={tx.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3.5 hover:border-slate-200 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${isDebitFlow ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {isDebitFlow ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 leading-tight">
                        {tx.title !== "Wallet Log Operational Entry" ? tx.title : formatTxTypeLabel(tx.type)}
                      </h4>
                      <p className="text-[9px] font-mono text-slate-400 mt-0.5 tracking-tight">
                        {/* Fix 2: Explicit TXID fallback mapping injection */}
                        TXID: {(tx.transactionId || tx.id).slice(0, 10).toUpperCase()} | {formatTxDate(tx.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-black tracking-tight ${isDebitFlow ? 'text-slate-800' : 'text-emerald-600'}`}>
                      {isDebitFlow ? "-" : "+"}₹{tx.amount.toLocaleString('en-IN')}
                    </p>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase ${
                      tx.status === "success" ? "bg-emerald-50 text-emerald-700" :
                      tx.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-4 text-[10px] text-slate-500 font-semibold">
                  <div>
                    <p className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Allocation Channel</p>
                    <p className="text-slate-700 font-black mt-0.5 truncate">
                      {tx.walletType} {tx.destinationWallet ? `➔ ${tx.destinationWallet}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Audit Balance Drift</p>
                    <p className="font-mono text-slate-700 font-black mt-0.5">
                      {typeof tx.beforeWalletBalance === "number" && typeof tx.afterWalletBalance === "number" ? (
                        `₹${tx.beforeWalletBalance} ➔ ₹${tx.afterWalletBalance}`
                      ) : (
                        <span className="text-slate-400 font-normal italic">N/A (Historical Sync)</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
