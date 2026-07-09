"use client";

export const dynamic = "force-dynamic";

import {
  Wallet,
  DollarSign,
  CreditCard,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle
} from "lucide-react";

export default function FinancePage() {

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-green-600">

          <Wallet size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Finance Dashboard
          </h1>

          <p className="mt-1 text-sm text-[var(--muted-text-color)]">
            Payment & earnings overview
          </p>

        </div>

      </div>

      {/* CARDS */}

      <div className="grid grid-cols-2 gap-4">

        <div className="rounded-[30px] bg-[#151515] p-5">

          <DollarSign
            size={28}
            className="text-green-400"
          />

          <p className="mt-5 text-sm text-[var(--muted-text-color)]">
            Total Earnings
          </p>

          <h2 className="mt-2 text-3xl font-black">
            ₹4,85,000
          </h2>

        </div>

        <div className="rounded-[30px] bg-[#151515] p-5">

          <CreditCard
            size={28}
            className="theme-primary-text"
          />

          <p className="mt-5 text-sm text-[var(--muted-text-color)]">
            Pending Payments
          </p>

          <h2 className="mt-2 text-3xl font-black">
            ₹32,500
          </h2>

        </div>

      </div>

      {/* TRANSACTIONS */}

      <div className="mt-6 rounded-[30px] bg-[#151515] p-5">

        <div className="mb-5 flex items-center justify-between">

          <h2 className="text-2xl font-black">
            Recent Transactions
          </h2>

          <TrendingUp
            size={22}
            className="text-green-400"
          />

        </div>

        <div className="space-y-4">

          <div className="flex items-center justify-between rounded-2xl bg-[var(--card-color)]/30 p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--success-color)]/20">

                <ArrowDownCircle
                  size={22}
                  className="text-green-400"
                />

              </div>

              <div>

                <p className="font-bold">
                  Order Payment
                </p>

                <p className="text-sm text-[var(--muted-text-color)]">
                  Received from customer
                </p>

              </div>

            </div>

            <h3 className="text-lg font-black text-green-400">
              +₹2,500
            </h3>

          </div>

          <div className="flex items-center justify-between rounded-2xl bg-[var(--card-color)]/30 p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--danger-color)]/20">

                <ArrowUpCircle
                  size={22}
                  className="text-red-400"
                />

              </div>

              <div>

                <p className="font-bold">
                  Affiliate Payout
                </p>

                <p className="text-sm text-[var(--muted-text-color)]">
                  Sent to affiliate
                </p>

              </div>

            </div>

            <h3 className="text-lg font-black text-red-400">
              -₹1,200
            </h3>

          </div>

        </div>

      </div>

      {/* SUMMARY */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-green-600 to-emerald-500 p-6">

        <h2 className="text-3xl font-black">
          Finance Summary
        </h2>

        <p className="mt-2 text-[var(--button-text-color)]/80">
          Revenue performance this month
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4">

          <div className="rounded-2xl bg-[var(--card-color)]/10 p-4">

            <p className="text-sm">
              Profit
            </p>

            <h3 className="mt-2 text-3xl font-black">
              ₹1.2L
            </h3>

          </div>

          <div className="rounded-2xl bg-[var(--card-color)]/10 p-4">

            <p className="text-sm">
              Expenses
            </p>

            <h3 className="mt-2 text-3xl font-black">
              ₹48K
            </h3>

          </div>

        </div>

      </div>

    </main>

  );
}
