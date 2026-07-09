"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  Users,
  Gift,
  IndianRupee,
  Copy,
  CheckCircle
} from "lucide-react";

interface ReferralItem {
  id: number;
  user: string;
  code: string;
  earnings: string;
  joins: number;
}

export default function ReferralsPage() {

  const [referrals] =
    useState<ReferralItem[]>([
      {
        id: 1,
        user: "Rahul Kumar",
        code: "RAHUL100",
        earnings: "₹4,500",
        joins: 24
      },
      {
        id: 2,
        user: "Aman Ali",
        code: "AMAN500",
        earnings: "₹2,300",
        joins: 14
      },
      {
        id: 3,
        user: "Sneha Sharma",
        code: "SNEHA50",
        earnings: "₹7,800",
        joins: 42
      }
    ]);

  function copyCode(
    code: string
  ) {

    navigator.clipboard.writeText(
      code
    );

    alert(
      "Referral Code Copied"
    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-violet-600">

          <Users size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Referral System
          </h1>

          <p className="mt-1 text-sm text-[var(--muted-text-color)]">
            Manage referral earnings & codes
          </p>

        </div>

      </div>

      {/* STATS */}

      <div className="mb-6 grid grid-cols-3 gap-4">

        <div className="rounded-[30px] bg-[#151515] p-5">

          <Gift
            size={28}
            className="text-pink-400"
          />

          <p className="mt-4 text-sm text-[var(--muted-text-color)]">
            Total Referrals
          </p>

          <h2 className="mt-2 text-3xl font-black">
            248
          </h2>

        </div>

        <div className="rounded-[30px] bg-[#151515] p-5">

          <IndianRupee
            size={28}
            className="text-green-400"
          />

          <p className="mt-4 text-sm text-[var(--muted-text-color)]">
            Total Earnings
          </p>

          <h2 className="mt-2 text-3xl font-black">
            ₹2.4L
          </h2>

        </div>

        <div className="rounded-[30px] bg-[#151515] p-5">

          <CheckCircle
            size={28}
            className="text-cyan-400"
          />

          <p className="mt-4 text-sm text-[var(--muted-text-color)]">
            Active Users
          </p>

          <h2 className="mt-2 text-3xl font-black">
            128
          </h2>

        </div>

      </div>

      {/* REFERRAL USERS */}

      <div className="space-y-5">

        {referrals.map(
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
                    Total Joins:
                    {" "}
                    {item.joins}
                  </p>

                </div>

                <div className="text-right">

                  <h3 className="text-2xl font-black text-green-400">
                    {item.earnings}
                  </h3>

                  <p className="mt-1 text-sm text-[var(--muted-text-color)]">
                    Earnings
                  </p>

                </div>

              </div>

              <div className="mt-5 flex items-center justify-between rounded-2xl bg-[var(--card-color)]/30 p-4">

                <div>

                  <p className="text-sm text-[var(--muted-text-color)]">
                    Referral Code
                  </p>

                  <h3 className="mt-1 text-xl font-black">
                    {item.code}
                  </h3>

                </div>

                <button
                  onClick={() =>
                    copyCode(
                      item.code
                    )
                  }
                  className="flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-bold"
                >

                  <Copy size={18} />

                  Copy

                </button>

              </div>

            </div>

          )
        )}

      </div>

      {/* PREVIEW */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-violet-600 to-fuchsia-500 p-6">

        <h2 className="text-3xl font-black">
          Referral Program
        </h2>

        <p className="mt-2 text-[var(--button-text-color)]/80">
          Invite friends & earn commission
        </p>

      </div>

    </main>

  );
}
