"use client";

import Link from "next/link";

import {
  ArrowLeft,
  BadgeIndianRupee,
  CalendarDays,
  Crown,
  Gift,
  TrendingUp,
  Users
} from "lucide-react";

export default function EarningsPage() {

  const totalEarnings =
    12450;

  const todayIncome =
    820;

  const monthlyIncome =
    6540;

  const referralBonus =
    2100;

  const earningsHistory = [

    {
      title:
        "Level 1 Referral Income",
      amount: 450,
      date: "Today"
    },

    {
      title:
        "Product Cashback",
      amount: 120,
      date: "Yesterday"
    },

    {
      title:
        "Level 2 Team Bonus",
      amount: 250,
      date: "2 days ago"
    },

    {
      title:
        "Direct Referral Bonus",
      amount: 700,
      date: "3 days ago"
    }

  ];

  return (

    <main className="min-h-screen bg-[#f6f6f6] pb-24">

      {/* HEADER */}

      <div
        className="
          sticky
          top-0
          z-50
          bg-white
          px-4
          py-3
          shadow-sm
        "
      >

        <div className="flex items-center gap-3">

          <Link
            href="/mlm/dashboard"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-violet-100
              text-violet-700
            "
          >

            <ArrowLeft size={20} />

          </Link>

          <div>

            <h1 className="text-[24px] font-black text-violet-700">

              Earnings

            </h1>

            <p className="text-[11px] text-gray-500">

              MLM Income Overview

            </p>

          </div>

        </div>

      </div>

      {/* HERO */}

      <section className="px-4 pt-5">

        <div
          className="
            overflow-hidden
            rounded-[30px]
            bg-gradient-to-br
            from-violet-700
            via-fuchsia-600
            to-orange-500
            p-5
            text-white
            shadow-xl
          "
        >

          <div
            className="
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-full
              bg-white/20
            "
          >

            <Crown size={34} />

          </div>

          <p className="mt-5 text-[13px] text-white/80">

            Total MLM Earnings

          </p>

          <h2 className="mt-2 text-[42px] font-black">

            ₹{totalEarnings}

          </h2>

          <p className="mt-3 text-[12px] text-white/85">

            Aapki total MLM aur referral
            earnings yahan dikhengi.

          </p>

        </div>

      </section>

      {/* STATS */}

      <section className="mt-6 px-4">

        <div className="grid grid-cols-2 gap-3">

          <div
            className="
              rounded-2xl
              bg-white
              p-4
              shadow-sm
            "
          >

            <BadgeIndianRupee
              size={28}
              className="text-green-600"
            />

            <h3 className="mt-3 text-[24px] font-black">

              ₹{todayIncome}

            </h3>

            <p className="text-[12px] text-gray-500">

              Today's Income

            </p>

          </div>

          <div
            className="
              rounded-2xl
              bg-white
              p-4
              shadow-sm
            "
          >

            <CalendarDays
              size={28}
              className="text-orange-600"
            />

            <h3 className="mt-3 text-[24px] font-black">

              ₹{monthlyIncome}

            </h3>

            <p className="text-[12px] text-gray-500">

              Monthly Earnings

            </p>

          </div>

          <div
            className="
              rounded-2xl
              bg-white
              p-4
              shadow-sm
            "
          >

            <Gift
              size={28}
              className="text-pink-600"
            />

            <h3 className="mt-3 text-[24px] font-black">

              ₹{referralBonus}

            </h3>

            <p className="text-[12px] text-gray-500">

              Referral Bonus

            </p>

          </div>

          <div
            className="
              rounded-2xl
              bg-white
              p-4
              shadow-sm
            "
          >

            <Users
              size={28}
              className="text-violet-700"
            />

            <h3 className="mt-3 text-[24px] font-black">

              125

            </h3>

            <p className="text-[12px] text-gray-500">

              Total Team

            </p>

          </div>

        </div>

      </section>

      {/* GROWTH */}

      <section className="mt-6 px-4">

        <div
          className="
            rounded-[28px]
            bg-white
            p-5
            shadow-sm
          "
        >

          <div className="flex items-center gap-3">

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                bg-violet-100
                text-violet-700
              "
            >

              <TrendingUp size={24} />

            </div>

            <div>

              <h2 className="text-[20px] font-black">

                Income Growth

              </h2>

              <p className="text-[11px] text-gray-500">

                Your MLM performance

              </p>

            </div>

          </div>

          <div className="mt-5 flex items-end gap-2">

            <div className="h-16 w-full rounded-t-xl bg-violet-200" />

            <div className="h-24 w-full rounded-t-xl bg-violet-400" />

            <div className="h-20 w-full rounded-t-xl bg-fuchsia-400" />

            <div className="h-32 w-full rounded-t-xl bg-orange-400" />

            <div className="h-40 w-full rounded-t-xl bg-violet-700" />

          </div>

        </div>

      </section>

      {/* HISTORY */}

      <section className="mt-6 px-4">

        <div
          className="
            rounded-[28px]
            bg-white
            p-5
            shadow-sm
          "
        >

          <h2 className="text-[22px] font-black">

            Earnings History

          </h2>

          <div className="mt-5 space-y-3">

            {earningsHistory.map(
              (item, index) => (

                <div
                  key={index}
                  className="
                    flex
                    items-center
                    justify-between
                    rounded-2xl
                    bg-gray-50
                    p-4
                  "
                >

                  <div>

                    <h3 className="text-[14px] font-black">

                      {item.title}

                    </h3>

                    <p className="mt-1 text-[11px] text-gray-500">

                      {item.date}

                    </p>

                  </div>

                  <div
                    className="
                      rounded-full
                      bg-green-100
                      px-3
                      py-1
                      text-[12px]
                      font-black
                      text-green-700
                    "
                  >

                    + ₹{item.amount}

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </section>

    </main>

  );

}
