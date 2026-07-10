"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  Wallet,
  CheckCircle,
  XCircle,
  Clock3,
  IndianRupee
} from "lucide-react";

interface WithdrawalItem {
  id: number;
  user: string;
  amount: string;
  status: string;
}

export default function WithdrawalsPage() {

  const [withdrawals, setWithdrawals] =
    useState<WithdrawalItem[]>([
      {
        id: 1,
        user: "Rahul Kumar",
        amount: "₹2,500",
        status: "pending"
      },
      {
        id: 2,
        user: "Aman Ali",
        amount: "₹1,200",
        status: "approved"
      },
      {
        id: 3,
        user: "Sneha Sharma",
        amount: "₹4,000",
        status: "rejected"
      }
    ]);

  function updateStatus(
    id: number,
    status: string
  ) {

    setWithdrawals((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status
            }
          : item
      )
    );
  }

  return (

    <main className="min-h-screen bg-[var(--primary-color)] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--success-color)]">

          <Wallet size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Withdrawals
          </h1>

          <p className="mt-1 text-sm text-[var(--muted-text-color)]">
            Manage affiliate withdrawals
          </p>

        </div>

      </div>

      {/* STATS */}

      <div className="mb-6 grid grid-cols-3 gap-4">

        <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

          <Clock3
            size={28}
            className="text-[var(--warning-color)]"
          />

          <p className="mt-4 text-sm text-[var(--muted-text-color)]">
            Pending
          </p>

          <h2 className="mt-2 text-3xl font-black">
            12
          </h2>

        </div>

        <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

          <CheckCircle
            size={28}
            className="text-[var(--success-color)]"
          />

          <p className="mt-4 text-sm text-[var(--muted-text-color)]">
            Approved
          </p>

          <h2 className="mt-2 text-3xl font-black">
            48
          </h2>

        </div>

        <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

          <IndianRupee
            size={28}
            className="text-[var(--primary-color)]"
          />

          <p className="mt-4 text-sm text-[var(--muted-text-color)]">
            Total Paid
          </p>

          <h2 className="mt-2 text-3xl font-black">
            ₹1.5L
          </h2>

        </div>

      </div>

      {/* WITHDRAWAL LIST */}

      <div className="space-y-5">

        {withdrawals.map(
          (item) => (

            <div
              key={item.id}
              className="rounded-[30px] bg-[var(--primary-color)] p-5"
            >

              <div className="flex items-center justify-between gap-4">

                <div>

                  <h2 className="text-2xl font-black">
                    {item.user}
                  </h2>

                  <p className="mt-2 text-sm text-[var(--muted-text-color)]">
                    Withdrawal Request
                  </p>

                </div>

                <div className="text-right">

                  <h3 className="text-2xl font-black text-[var(--success-color)]">
                    {item.amount}
                  </h3>

                  <p className="mt-1 text-sm capitalize text-[var(--muted-text-color)]">
                    {item.status}
                  </p>

                </div>

              </div>

              <div className="mt-5 flex gap-3">

                <button
                  onClick={() =>
                    updateStatus(
                      item.id,
                      "approved"
                    )
                  }
                  className="flex items-center gap-2 rounded-2xl bg-[var(--success-color)] px-5 py-3 text-sm font-bold"
                >

                  <CheckCircle size={18} />

                  Approve

                </button>

                <button
                  onClick={() =>
                    updateStatus(
                      item.id,
                      "rejected"
                    )
                  }
                  className="flex items-center gap-2 rounded-2xl bg-[var(--danger-color)] px-5 py-3 text-sm font-bold"
                >

                  <XCircle size={18} />

                  Reject

                </button>

              </div>

            </div>

          )
        )}

      </div>

      {/* PREVIEW */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)] p-6">

        <h2 className="text-3xl font-black">
          Withdrawal Overview
        </h2>

        <p className="mt-2 text-[var(--button-text-color)]/80">
          Affiliate payout system preview
        </p>

      </div>

    </main>

  );
}
