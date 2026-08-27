"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeIndianRupee,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Gift,
  MousePointerClick,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import { auth, db } from "@/firebase/config";
import { useWallet } from "@/hooks/useWallet";

type CreatorEarning = {
  id: string;
  eventId?: string;
  adId?: string;
  adTitle?: string;
  eventType?: "impression" | "click";
  pricingModel?: string;
  charge?: number;
  creatorAmount?: number;
  creatorRevenueSharePercent?: number;
  status?: "PENDING" | "AVAILABLE";
  payoutDueAt?: any;
  createdAt?: any;
  releasedAt?: any;
};

function money(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function dateText(value: any) {
  if (!value) return "—";

  try {
    const date =
      typeof value?.toDate === "function"
        ? value.toDate()
        : new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function EarningsPage() {
  const { wallet, loading: walletLoading } = useWallet();

  const [userId, setUserId] = useState<string | null>(null);
  const [creatorEarnings, setCreatorEarnings] = useState<CreatorEarning[]>([]);
  const [loadingEarnings, setLoadingEarnings] = useState(true);
  const [error, setError] = useState("");

  /* AUTH */
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);
    });
  }, []);

  /* CREATOR AD EARNINGS */
  useEffect(() => {
    if (!userId) {
      setCreatorEarnings([]);
      setLoadingEarnings(false);
      return;
    }

    let cancelled = false;

    async function loadCreatorEarnings() {
      setLoadingEarnings(true);
      setError("");

      try {
        /*
         * creatorAdEarnings is the authoritative source for
         * creator's ad revenue.
         *
         * We intentionally do not calculate creator earnings
         * from adEvents because that can cause duplicate counting.
         */
        const ref = collection(db, "creatorAdEarnings");

        const q = query(
          ref,
          where("creatorId", "==", userId),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        if (cancelled) return;

        const rows: CreatorEarning[] = snapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            eventId: data.eventId,
            adId: data.adId,
            adTitle: data.adTitle || "Advertisement",
            eventType: data.eventType,
            pricingModel: data.pricingModel,
            charge: Number(data.charge || 0),
            creatorAmount: Number(data.creatorAmount || 0),
            creatorRevenueSharePercent: Number(
              data.creatorRevenueSharePercent || 0
            ),
            status: data.status,
            payoutDueAt: data.payoutDueAt,
            createdAt: data.createdAt,
            releasedAt: data.releasedAt,
          };
        });

        setCreatorEarnings(rows);
      } catch (err: any) {
        console.error("Creator earnings load failed:", err);

        /*
         * The data itself is still safe to display if the
         * optional earnings query is blocked by Firestore rules.
         */
        setCreatorEarnings([]);

        if (err?.code === "failed-precondition") {
          setError(
            "Earnings index is required. The page is ready; Firestore index needs to be created."
          );
        } else if (err?.code === "permission-denied") {
          setError(
            "Creator earnings are currently restricted by Firestore security rules."
          );
        } else {
          setError("Creator earnings could not be loaded right now.");
        }
      } finally {
        if (!cancelled) setLoadingEarnings(false);
      }
    }

    loadCreatorEarnings();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  /* AD EARNING CALCULATIONS */
  const adStats = useMemo(() => {
    let total = 0;
    let available = 0;
    let pending = 0;
    let impressions = 0;
    let clicks = 0;
    let totalAdCharge = 0;

    for (const item of creatorEarnings) {
      const amount = Number(item.creatorAmount || 0);

      total += amount;
      totalAdCharge += Number(item.charge || 0);

      if (item.status === "AVAILABLE") {
        available += amount;
      }

      if (item.status === "PENDING") {
        pending += amount;
      }

      if (item.eventType === "impression") {
        impressions++;
      }

      if (item.eventType === "click") {
        clicks++;
      }
    }

    return {
      total,
      available,
      pending,
      impressions,
      clicks,
      totalAdCharge,
    };
  }, [creatorEarnings]);

  /*
   * totalIncome is already maintained by the existing wallet system.
   *
   * adminCreditWallet() also adds released ad revenue to totalIncome.
   * Therefore we subtract AVAILABLE creator ad earnings to avoid
   * counting released ad revenue twice when showing MLM/other income.
   */
  const creditedTotalIncome = Number(wallet?.totalIncome || 0);

  const mlmIncome = Math.max(
    0,
    creditedTotalIncome - adStats.available
  );

  /*
   * Pending creator earnings are not yet in wallet.totalIncome.
   * Therefore they are added only to "Total Earned" and not to
   * credited wallet income.
   */
  const totalEarned = creditedTotalIncome + adStats.pending;

  const commissionWallet = Number(wallet?.commissionWallet || 0);
  const rewardWallet = Number(wallet?.rewardWallet || 0);
  const cashbackWallet = Number(wallet?.cashbackWallet || 0);

  const availableWallet = Number(wallet?.walletBalance || 0);

  const loading = walletLoading || loadingEarnings;

  return (
    <main className="min-h-screen bg-[var(--color-page-background)] pb-24 text-[var(--text-primary)]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-[var(--color-card-background)] px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/mlm/watch-earn"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-button)] text-[var(--button-text-color)]"
          >
            <ArrowLeft size={20} />
          </Link>

          <div>
            <h1 className="text-[23px] font-black text-[var(--text-primary)]">
              Earnings
            </h1>
            <p className="text-[11px] text-[var(--text-secondary)]">
              MLM + Creator Ad Earnings
            </p>
          </div>
        </div>
      </header>

      {/* TOTAL */}
      <section className="px-4 pt-5">
        <div className="overflow-hidden rounded-[30px] bg-gradient-to-br from-[var(--color-primary-button)] via-[var(--color-primary-button)] to-[var(--color-primary-button)] p-5 text-[var(--button-text-color)] shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
              <Wallet size={30} />
            </div>

            <div>
              <p className="text-[12px] opacity-80">
                Total Earned
              </p>

              <h2 className="text-[36px] font-black">
                {loading ? "₹..." : money(totalEarned)}
              </h2>
            </div>
          </div>

          <p className="mt-4 text-[12px] leading-5 opacity-85">
            MLM income aur Creator Ad income dono ka combined
            earning overview.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-[10px] opacity-70">
                MLM / Other Income
              </p>
              <p className="mt-1 text-[18px] font-black">
                {loading ? "₹..." : money(mlmIncome)}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-[10px] opacity-70">
                Creator Ad Income
              </p>
              <p className="mt-1 text-[18px] font-black">
                {loading ? "₹..." : money(adStats.total)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MLM SECTION */}
      <section className="mt-6 px-4">
        <div className="rounded-[28px] bg-[var(--color-card-background)] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-button)]/10">
              <BadgeIndianRupee
                size={25}
                className="text-[var(--color-primary-button)]"
              />
            </div>

            <div>
              <h2 className="text-[20px] font-black">
                MLM Income
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Existing MLM wallet system
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[var(--color-page-background)] p-4">
              <Users
                size={21}
                className="text-[var(--color-primary-button)]"
              />
              <p className="mt-2 text-[22px] font-black">
                {money(mlmIncome)}
              </p>
              <p className="text-[11px] text-[var(--text-secondary)]">
                MLM / Other Income
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--color-page-background)] p-4">
              <Wallet
                size={21}
                className="text-[var(--color-success)]"
              />
              <p className="mt-2 text-[22px] font-black">
                {money(availableWallet)}
              </p>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Current Wallet
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--color-page-background)] p-4">
              <BadgeIndianRupee
                size={21}
                className="text-[var(--color-success)]"
              />
              <p className="mt-2 text-[22px] font-black">
                {money(commissionWallet)}
              </p>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Commission Wallet
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--color-page-background)] p-4">
              <Gift
                size={21}
                className="text-[var(--color-warning)]"
              />
              <p className="mt-2 text-[22px] font-black">
                {money(rewardWallet)}
              </p>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Reward Wallet
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-2xl bg-[var(--color-page-background)] p-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[var(--text-secondary)]">
                Cashback Wallet
              </span>

              <span className="font-black">
                {money(cashbackWallet)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CREATOR AD EARNINGS */}
      <section className="mt-6 px-4">
        <div className="rounded-[28px] bg-[var(--color-card-background)] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-button)]/10">
              <BarChart3
                size={25}
                className="text-[var(--color-primary-button)]"
              />
            </div>

            <div>
              <h2 className="text-[20px] font-black">
                Creator Ad Earnings
              </h2>

              <p className="text-[11px] text-[var(--text-secondary)]">
                Aapke ads se actual earning
              </p>
            </div>
          </div>

          {/* AD MONEY */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[var(--color-page-background)] p-4">
              <TrendingUp
                size={21}
                className="text-[var(--color-success)]"
              />

              <p className="mt-2 text-[22px] font-black">
                {money(adStats.total)}
              </p>

              <p className="text-[11px] text-[var(--text-secondary)]">
                Total Ad Earnings
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--color-page-background)] p-4">
              <CheckCircle2
                size={21}
                className="text-[var(--color-success)]"
              />

              <p className="mt-2 text-[22px] font-black">
                {money(adStats.available)}
              </p>

              <p className="text-[11px] text-[var(--text-secondary)]">
                Available
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--color-page-background)] p-4">
              <Clock3
                size={21}
                className="text-[var(--color-warning)]"
              />

              <p className="mt-2 text-[22px] font-black">
                {money(adStats.pending)}
              </p>

              <p className="text-[11px] text-[var(--text-secondary)]">
                Pending
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--color-page-background)] p-4">
              <BadgeIndianRupee
                size={21}
                className="text-[var(--color-primary-button)]"
              />

              <p className="mt-2 text-[22px] font-black">
                {money(adStats.totalAdCharge)}
              </p>

              <p className="text-[11px] text-[var(--text-secondary)]">
                Ad Revenue Generated
              </p>
            </div>
          </div>

          {/* IMPRESSIONS / CLICKS */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[var(--color-page-background)] p-4">
              <Eye
                size={21}
                className="text-[var(--color-primary-button)]"
              />

              <p className="mt-2 text-[22px] font-black">
                {adStats.impressions.toLocaleString("en-IN")}
              </p>

              <p className="text-[11px] text-[var(--text-secondary)]">
                Impressions
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--color-page-background)] p-4">
              <MousePointerClick
                size={21}
                className="text-[var(--color-primary-button)]"
              />

              <p className="mt-2 text-[22px] font-black">
                {adStats.clicks.toLocaleString("en-IN")}
              </p>

              <p className="text-[11px] text-[var(--text-secondary)]">
                Clicks
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 p-4 text-[12px]">
              {error}
            </div>
          )}
        </div>
      </section>

      {/* AD HISTORY */}
      <section className="mt-6 px-4">
        <div className="rounded-[28px] bg-[var(--color-card-background)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[21px] font-black">
                Ad Earning History
              </h2>

              <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
                Har ad event ka earning record
              </p>
            </div>

            <BarChart3 size={22} />
          </div>

          {loadingEarnings ? (
            <div className="py-10 text-center text-sm text-[var(--text-secondary)]">
              Loading earnings...
            </div>
          ) : creatorEarnings.length === 0 ? (
            <div className="py-10 text-center">
              <BarChart3
                size={38}
                className="mx-auto text-[var(--text-secondary)]"
              />

              <p className="mt-3 text-sm font-bold">
                No creator ad earnings yet
              </p>

              <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
                Jab aapke ad events se earning generate hogi,
                yahan poora record dikhega.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {creatorEarnings.map((item) => {
                const isAvailable = item.status === "AVAILABLE";

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-[var(--color-page-background)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-[14px] font-black">
                          {item.adTitle || "Advertisement"}
                        </h3>

                        <p className="mt-1 text-[10px] text-[var(--text-secondary)]">
                          {item.eventType === "click"
                            ? "Click"
                            : "Impression"}{" "}
                          •{" "}
                          {item.pricingModel || "Ad"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[17px] font-black">
                          + {money(item.creatorAmount || 0)}
                        </p>

                        <span
                          className={`mt-1 inline-flex rounded-full px-2 py-1 text-[9px] font-black ${
                            isAvailable
                              ? "bg-[var(--color-success)]/15 text-[var(--color-success)]"
                              : "bg-[var(--color-warning)]/15 text-[var(--color-warning)]"
                          }`}
                        >
                          {isAvailable ? "AVAILABLE" : "PENDING"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-[var(--text-secondary)]">
                          Ad Charge
                        </span>

                        <p className="font-bold">
                          {money(item.charge || 0)}
                        </p>
                      </div>

                      <div>
                        <span className="text-[var(--text-secondary)]">
                          Creator Share
                        </span>

                        <p className="font-bold">
                          {item.creatorRevenueSharePercent || 0}%
                        </p>
                      </div>

                      <div>
                        <span className="text-[var(--text-secondary)]">
                          Event Date
                        </span>

                        <p className="font-bold">
                          {dateText(item.createdAt)}
                        </p>
                      </div>

                      <div>
                        <span className="text-[var(--text-secondary)]">
                          {isAvailable ? "Released" : "Payment Due"}
                        </span>

                        <p className="font-bold">
                          {dateText(
                            isAvailable
                              ? item.releasedAt
                              : item.payoutDueAt
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* EXPLANATION */}
      <section className="mt-6 px-4">
        <div className="rounded-[28px] bg-[var(--color-card-background)] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <CalendarDays
              size={22}
              className="text-[var(--color-primary-button)]"
            />

            <h2 className="text-[18px] font-black">
              Earnings kaise calculate hoti hai?
            </h2>
          </div>

          <div className="mt-4 space-y-3 text-[12px] leading-5 text-[var(--text-secondary)]">
            <p>
              <b className="text-[var(--text-primary)]">
                MLM Income:
              </b>{" "}
              Referral, commission, cashback aur reward system
              se aane wali income.
            </p>

            <p>
              <b className="text-[var(--text-primary)]">
                Creator Ad Income:
              </b>{" "}
              Aapke ads par eligible impressions/clicks se
              generate hui creator share.
            </p>

            <p>
              <b className="text-[var(--text-primary)]">
                Pending:
              </b>{" "}
              Earning record ho chuki hai lekin payout delay
              complete nahi hua.
            </p>

            <p>
              <b className="text-[var(--text-primary)]">
                Available:
              </b>{" "}
              Payout release hone ke baad wallet mein credited
              creator earning.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
