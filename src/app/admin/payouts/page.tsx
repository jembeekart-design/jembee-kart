"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  Wallet,
  Banknote,
  CheckCircle,
  Clock3,
  XCircle,
  Send
} from "lucide-react";

interface PayoutItem {
  id: number;
  user: string;
  amount: string;
  method: string;
  status: string;
}

export default function PayoutsPage() {

  const [payouts, setPayouts] =
    useState<PayoutItem[]>([
      {
        id: 1,
        user: "Rahul Kumar",
        amount: "₹3,500",
        method: "UPI",
        status: "pending"
      },
      {
        id: 2,
        user: "Aman Ali",
        amount: "₹1,200",
        method: "Bank",
        status: "approved"
      },
      {
        id: 3,
        user: "Sneha Sharma",
        amount: "₹5,000",
        method: "Wallet",
        status: "rejected"
      }
    ]);

  function updateStatus(
    id: number,
    status: string
  ) {

    setPayouts((prev) =>
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

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-emerald-600">

          <Wallet size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Payout Manager
          </h1>

          <p className="mt-1 text-sm text-[var(--muted-text-color)]">
            Manage affiliate & reseller payouts
          </p>

        </div>

      </div>

      {/* STATS */}

      <div className="mb-6 grid grid-cols-3 gap-4">

        <div className="rounded-[30px] bg-[#151515] p-5">

          <Clock3
            size={28}
            className="text-yellow-400"
          />

          <p className="mt-4 text-sm text-[var(--muted-text-color)]">
            Pending
          </p>

          <h2 className="mt-2 text-3xl font-black">
            18
          </h2>

        </div>

        <div className="rounded-[30px] bg-[#151515] p-5">

          <CheckCircle
            size={28}
            className="text-green-400"
          />

          <p className="mt-4 text-sm text-[var(--muted-text-color)]">
            Approved
          </p>

          <h2 className="mt-2 text-3xl font-black">
            86
          </h2>

        </div>

        <div className="rounded-[30px] bg-[#151515] p-5">

          <Banknote
            size={28}
            className="text-cyan-400"
          />

          <p className="mt-4 text-sm text-[var(--muted-text-color)]">
            Total Paid
          </p>

          <h2 className="mt-2 text-3xl font-black">
            ₹3.2L
          </h2>

        </div>

      </div>

      {/* PAYOUT LIST */}

      <div className="space-y-5">

        {payouts.map(
          (item) => (

            <div
              key={item.id}
              className="rounded-[30px] bg-[#151515] p-5"
            >

              <div className="flex items-center justify-between gap-4">

                <div>

                  <h2 className="text-2xl font-black">
                    {item.user}
                  </h2>

                  <p className="mt-2 text-sm text-[var(--muted-text-color)]">
                    Method:
                    {" "}
                    {item.method}
                  </p>

                </div>

                <div className="text-right">

                  <h3 className="text-2xl font-black text-green-400">
                    {item.amount}
                  </h3>

                  <p className="mt-1 text-sm capitalize text-[var(--muted-text-color)]">
                    {item.status}
                  </p>

                </div>

              </div>

              <div className="mt-5 flex flex-wrap gap-3">

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

                <button
                  className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold"
                >

                  <Send size={18} />

                  Send Payment

                </button>

              </div>

            </div>

          )
        )}

      </div>

      {/* PREVIEW */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-emerald-600 to-cyan-500 p-6">

        <h2 className="text-3xl font-black">
          Payout Overview
        </h2>

        <p className="mt-2 text-[var(--button-text-color)]/80">
          Affiliate payment system preview
        </p>

      </div>

    </main>

  );
}
