"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { onAuthStateChanged, User } from "firebase/auth";
import { 
  doc, 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  getDoc,
  Timestamp 
} from "firebase/firestore";
// Issue #1 Fix: Imported functions core component engine
import { getFunctions, httpsCallable } from "firebase/functions"; 
import { auth, db } from "@/firebase/config";

import {
  ArrowLeft,
  Gift,
  Wallet,
  Loader2,
  ArrowRightLeft,
  Search,
  SlidersHorizontal,
  Trophy,
  RotateCcw,
  BadgeAlert,
  ArrowUpRight,
  HandCoins,
  ShieldAlert,
  Zap
} from "lucide-react";

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

interface TransactionItem {
  id: string;
  title: string;
  amount: number;
  type: AllowedTransactionType;
  status: AllowedStatusType;
  orderId?: string;
  beforeBalance: number;
  afterBalance: number;
  createdAt?: Timestamp;
  expiryDate?: Timestamp;
}

interface WalletStats {
  walletBalance: number;
  commissionWallet: number;
  rewardWallet: number;
  cashbackWallet: number;
  pendingWithdrawal: number;
  todayIncome: number;
  totalIncome: number;
}

interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error" | "info";
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  amount: number;
}

function TransferConfirmModal({ isOpen, onClose, onConfirm, amount }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-[var(--card-color)]/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-[32px] bg-[var(--card-color)] p-6 shadow-xl animate-in fade-in slide-in-from-bottom duration-200">
        <div className="mx-auto h-1 w-12 rounded-full bg-[var(--card-color)] sm:hidden mb-4" />
        <h3 className="text-lg font-black text-[var(--text-color)]">Confirm Transfer</h3>
        <p className="mt-2 text-xs leading-relaxed text-[var(--text-color)]">
          Kya aap apne Cashback Wallet se <span className="font-bold text-[var(--text-color)]">₹{amount}</span> ko apne Main Wallet Balance me transfer karna chahte hain?
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={onConfirm}
            className="w-full rounded-2xl bg-[var(--success-color)] py-3.5 text-xs font-black text-[var(--button-text-color)] active:scale-95 transition-transform shadow-md"
          >
            Confirm Transfer
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-[var(--card-color)] py-3.5 text-xs font-black text-[var(--text-color)] active:scale-95 transition-transform"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CashbackPage() {
  const [stats, setStats] = useState<WalletStats>({
    walletBalance: 0,
    commissionWallet: 0,
    rewardWallet: 0,
    cashbackWallet: 0,
    pendingWithdrawal: 0,
    todayIncome: 0,
    totalIncome: 0,
  });

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [minTransferLimit, setMinTransferLimit] = useState<number>(100); 
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  const [toast, setToast] = useState<ToastState>({ show: false, message: "", type: "info" });

  // Issue #2 Fix: Integrated clean memory allocation parameters using references pointers
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerToast = (message: string, type: "success" | "error" | "info" = "success") => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setToast({ show: true, message, type });
    timeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  // Issue #2 Fix: Added global garbage tracking hooks inside component unmount events cycles
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let unsubscribeWallet: (() => void) | null = null;
    let unsubscribeTransactions: (() => void) | null = null;

    async function loadAppConfig() {
      try {
        const configSnap = await getDoc(doc(db, "settings", "appConfig"));
        if (configSnap.exists()) {
          const configData = configSnap.data();
          if (typeof configData.minimumCashbackTransfer === "number") {
            setMinTransferLimit(configData.minimumCashbackTransfer);
          }
        }
      } catch (err) {
        console.error("Config fetch optimization break fault:", err);
      }
    }

    loadAppConfig();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      setCurrentUser(user);

      const userRef = doc(db, "users", user.uid);

      unsubscribeWallet = onSnapshot(userRef, (snap) => {
        if (!snap.exists()) {
          setLoading(false);
          return;
        }
        
        const data = snap.data();
        
        // Issue #3 Fix: Validated pure types parameters matching the JembeeKart exact model rules
        setStats({
          walletBalance: typeof data.walletBalance === "number" ? data.walletBalance : 0,
          commissionWallet: typeof data.commissionWallet === "number" ? data.commissionWallet : 0,
          rewardWallet: typeof data.rewardWallet === "number" ? data.rewardWallet : 0,
          cashbackWallet: typeof data.cashbackWallet === "number" ? data.cashbackWallet : 0,
          pendingWithdrawal: typeof data.pendingWithdrawal === "number" ? data.pendingWithdrawal : 0,
          todayIncome: typeof data.todayIncome === "number" ? data.todayIncome : 0,
          totalIncome: typeof data.totalIncome === "number" ? data.totalIncome : 0,
        });
        setLoading(false);
      }, (error) => {
        console.error("User stream fault:", error);
        setLoading(false);
      });

      const transactionsRef = collection(db, "users", user.uid, "cashbackTransactions");
      const q = query(transactionsRef, orderBy("createdAt", "desc"));

      unsubscribeTransactions = onSnapshot(q, (snapshot) => {
        const txList: TransactionItem[] = snapshot.docs.map((doc) => {
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

          // Issue #3 Fix: Checked historical log objects for structural validation boundaries
          return {
            id: doc.id,
            title: d.title || "Cashback Entry Log",
            amount: typeof d.amount === "number" ? d.amount : 0,
            type: assertedType,
            status: assertedStatus,
            orderId: d.orderId,
            beforeBalance: typeof d.beforeBalance === "number" ? d.beforeBalance : 0,
            afterBalance: typeof d.afterBalance === "number" ? d.afterBalance : 0,
            createdAt: d.createdAt,
            expiryDate: d.expiryDate,
          };
        });
        setTransactions(txList);
        setLoading(false);
      }, (error) => {
        console.error("Collections monitoring channel error:", error);
        setLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeWallet) unsubscribeWallet();
      if (unsubscribeTransactions) unsubscribeTransactions();
    };
  }, []);

  // Issue #1 Fix: Refactored logic to securely handshake with isolated Cloud Functions instance
  async function handleAtomicWalletTransfer() {
    if (!currentUser || stats.cashbackWallet < minTransferLimit) return;
    setIsModalOpen(false);
    setIsTransferring(true);

    try {
      const functionsInstance = getFunctions(undefined, "asia-south1"); // Dynamic engine region lock matching
      const processTransferCloudFn = httpsCallable(functionsInstance, "processWalletTransfer");
      
      await processTransferCloudFn();
      triggerToast("Cashback transferred successfully!", "success");
    } catch (err: any) {
      console.error("Cloud execution error trace map logged:", err);
      triggerToast(`Transfer Failed: ${err.message || "Internal Exception"}`, "error");
    } finally {
      setIsTransferring(false);
    }
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const titleStr = (tx.title || "").toLowerCase();
      const orderIdStr = (tx.orderId || "").toLowerCase();
      const searchStr = searchQuery.toLowerCase();

      const matchesSearch = titleStr.includes(searchStr) || orderIdStr.includes(searchStr);

      if (activeFilter === "all") return matchesSearch;
      return matchesSearch && tx.status === activeFilter;
    });
  }, [transactions, searchQuery, activeFilter]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--card-color)]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-[var(--text-color)]" size={32} />
          <p className="text-xs font-bold text-[var(--text-color)] uppercase tracking-wider">Syncing balance paths...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--card-color)] pb-28">
      {/* TOAST NOTIFICATION LAYER */}
      {toast.show && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm rounded-2xl p-4 flex items-center gap-3 shadow-xl border animate-in fade-in slide-in-from-[var(--primary-color)] duration-300 bg-[var(--card-color)] text-[var(--button-text-color)] border-[var(--border-color)]">
          <div className={`h-2 w-2 rounded-full shrink-0 ${toast.type === "success" ? "bg-[var(--success-color)]" : "bg-[var(--danger-color)]"}`} />
          <p className="text-xs font-bold tracking-tight">{toast.message}</p>
        </div>
      )}

      {/* HEADER CONTENT WRAPPER */}
      <div className="sticky top-0 z-50 bg-[var(--card-color)]/90 backdrop-blur-md px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--card-color)] text-[var(--text-color)]">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-[20px] font-black text-[var(--text-color)] tracking-tight">Cashback Panel</h1>
            <p className="text-[10px] font-bold text-[var(--text-color)] uppercase tracking-tight flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-[var(--success-color)] rounded-full" /> Isolated V8 Cloud Security Layer
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        
        {/* ACCOUNT CORES MAPPINGS GRID VIEW CONTAINER */}
        <section className="bg-[var(--card-color)] rounded-[32px] p-5 border border-[var(--border-color)] space-y-4 shadow-sm">
          <div className="flex items-center gap-2 pb-1 border-b border-[var(--border-color)]">
            <SlidersHorizontal size={15} className="text-[var(--text-color)]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-color)]">JembeeKart Active Master Wallets</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-[var(--text-color)] uppercase tracking-tight">💳 Main Wallet Balance</p>
              <p className="text-base font-black text-[var(--text-color)]">₹{stats.walletBalance.toLocaleString("en-IN")}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-[var(--text-color)] uppercase tracking-tight">⚙️ Commission Wallet</p>
              <p className="text-base font-black text-[var(--text-color)]">₹{stats.commissionWallet.toLocaleString("en-IN")}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-[var(--text-color)] uppercase tracking-tight">🏆 Reward Wallet</p>
              <p className="text-base font-black text-[var(--text-color)]">₹{stats.rewardWallet.toLocaleString("en-IN")}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-[var(--text-color)] uppercase tracking-tight">💰 Cashback Wallet</p>
              <p className="text-base font-black text-[var(--success-color)]">₹{stats.cashbackWallet.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </section>

        {/* PRIMARY WALLET CTAS CARD MODULE */}
        <div className="rounded-[32px] bg-gradient-to-br from-[var(--primary-color)] via-[var(--primary-color)] to-[var(--primary-color)] p-6 text-[var(--button-text-color)] shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)]">Withdrawable Pool Allocation</p>
            <Wallet size={18} className="text-[var(--success-color)]" />
          </div>

          <h2 className="mt-2.5 text-4xl font-black tracking-tight">
            ₹{stats.cashbackWallet.toLocaleString("en-IN")}
          </h2>

          {stats.cashbackWallet < minTransferLimit && (
            <p className="mt-3.5 flex items-center gap-1.5 text-[11px] font-bold text-[var(--warning-color)]/90 bg-[var(--card-color)]/5 border border-[var(--border-color)]/10 px-3 py-2 rounded-xl w-fit">
              <BadgeAlert size={13} /> Minimum account balance criteria threshold: ₹{minTransferLimit}
            </p>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={isTransferring || stats.cashbackWallet < minTransferLimit}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-[var(--success-color)] hover:bg-[var(--success-color)] disabled:opacity-30 disabled:pointer-events-none py-3.5 text-xs font-black text-[var(--button-text-color)] shadow-md transition-all"
            >
              {isTransferring ? <Loader2 size={14} className="animate-spin" /> : <ArrowRightLeft size={14} />}
              Transfer Balance
            </button>

            <Link
              href="/dashboard/wallet/history"
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-[var(--card-color)]/10 border border-[var(--border-color)]/10 py-3.5 text-xs font-black text-[var(--button-text-color)] active:scale-[0.98] transition-all"
            >
              <HandCoins size={14} />
              Wallet Logs
            </Link>
          </div>
        </div>

        {/* METRICS STREAM CONTAINER */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[var(--card-color)] p-4 border border-[var(--border-color)] shadow-sm">
            <span className="text-[10px] font-bold tracking-wider text-[var(--text-color)] uppercase">Today's Income Stream</span>
            <h4 className="text-base font-black text-[var(--text-color)] mt-1">₹{stats.todayIncome.toLocaleString("en-IN")}</h4>
          </div>
          <div className="rounded-2xl bg-[var(--card-color)] p-4 border border-[var(--border-color)] shadow-sm">
            <span className="text-[10px] font-bold tracking-wider text-[var(--text-color)] uppercase">Total Verified Income</span>
            <h4 className="text-base font-black text-[var(--text-color)] mt-1">₹{stats.totalIncome.toLocaleString("en-IN")}</h4>
          </div>
        </div>

        {/* SECURITY RECONCILIATION NOTIFICATION */}
        <div className="rounded-2xl bg-[var(--success-color)] border border-[var(--success-color)] p-3.5 flex gap-2.5 text-[var(--text-color)]">
          <ShieldAlert size={18} className="text-[var(--success-color)] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h5 className="text-xs font-black text-[var(--success-color)]">Zero-Trust Cloud Network Architecture Guard Active</h5>
            <p className="text-[11px] leading-relaxed text-[var(--success-color)]/80 font-medium">
              Client execution runtime can no longer bypass database states. All asset allocation mutations are secured via isolated cloud container functions.
            </p>
          </div>
        </div>

        {/* SEARCH BAR CHIPS */}
        <div className="space-y-3 pt-1">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 text-[var(--text-color)] pointer-events-none" size={16} />
            <input
              type="text"
              placeholder="Search historical files records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--card-color)] border border-[var(--border-color)] rounded-2xl py-3.5 pl-10 pr-4 text-xs font-medium text-[var(--text-color)] outline-none focus:border-[var(--border-color)] shadow-sm"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {["all", "success", "pending", "failed"].map((filterOpt) => (
              <button
                key={filterOpt}
                onClick={() => setActiveFilter(filterOpt)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border shrink-0 ${
                  activeFilter === filterOpt ? "bg-[var(--card-color)] text-[var(--button-text-color)] border-[var(--border-color)] shadow-sm" : "bg-[var(--card-color)] text-[var(--text-color)] border-[var(--border-color)]"
                }`}
              >
                {filterOpt}
              </button>
            ))}
          </div>
        </div>

        {/* STATEMENTS TRANSACTIONS OUTPUT */}
        <section className="pt-1">
          <div className="flex items-center justify-between px-1 mb-3">
            <h3 className="text-xs font-black text-[var(--text-color)] uppercase tracking-wider">Cashback Statements Logging</h3>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="rounded-3xl bg-[var(--card-color)] p-8 text-center border border-[var(--border-color)] shadow-sm">
              <div className="w-14 h-14 bg-[var(--card-color)] text-[var(--text-color)] rounded-full flex items-center justify-center mx-auto">
                <Gift size={26} />
              </div>
              <h3 className="mt-4 text-sm font-black text-[var(--text-color)]">No Statement Log Entries Found</h3>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTransactions.map((item) => (
                <div key={item.id} className="rounded-2xl bg-[var(--card-color)] p-4 shadow-sm border border-[var(--border-color)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                      item.status === "failed" ? "bg-[var(--danger-color)] text-[var(--danger-color)]" : item.status === "pending" ? "bg-[var(--warning-color)] text-[var(--warning-color)]" : "bg-[var(--success-color)] text-[var(--success-color)]"
                    }`}>
                      {item.type === "reward" ? <Trophy size={16} /> : item.type === "bonus" ? <Zap size={16} /> : item.type === "refund" ? <RotateCcw size={16} /> : item.type === "cashback_transfer" ? <ArrowUpRight size={16} /> : <Gift size={16} />}
                    </div>
                    
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-[13px] font-black text-[var(--text-color)] leading-tight">{item.title}</h4>
                        <span className="text-[9px] font-black bg-[var(--card-color)] text-[var(--text-color)] px-1.5 py-0.5 rounded uppercase tracking-tight">{item.type}</span>
                      </div>

                      <div className="flex flex-col gap-0.5 text-[11px] text-[var(--text-color)]">
                        {item.createdAt && (
                          <p className="font-medium text-[var(--text-color)]">
                            {item.createdAt.toDate?.().toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).replace(",", " •")}
                          </p>
                        )}
                        
                        <p className="text-[10px] font-mono tracking-tight opacity-75">Audit State Trail: ₹{item.beforeBalance} ➔ ₹{item.afterBalance}</p>

                        {item.orderId && (
                          <Link href={`/dashboard/orders/${item.orderId}`} className="text-[10px] font-bold text-[var(--primary-color)] hover:underline bg-[var(--primary-color)] px-1.5 py-0.5 rounded w-fit mt-0.5">
                            Order Token Ref: #{item.orderId}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right pl-2 shrink-0">
                    <p className={`text-[15px] font-black tracking-tight ${item.status === "failed" ? "text-[var(--danger-color)] line-through opacity-50" : item.status === "pending" ? "text-[var(--warning-color)]" : "text-[var(--success-color)]"}`}>
                      {item.status === "failed" ? "" : item.status === "pending" ? "" : item.type === "cashback_transfer" ? "-" : "+"}₹{item.amount}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-wider text-[var(--text-color)]">{item.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <TransferConfirmModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleAtomicWalletTransfer} amount={stats.cashbackWallet} />
    </main>
  );
}
