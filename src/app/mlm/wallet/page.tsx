"use client";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  BadgeIndianRupee,
  CreditCard,
  Gift,
  Wallet
} from "lucide-react";

export default function MLMWalletPage() {

  const transactions = [

    {
      title:
        "Referral Income",
      amount: "+ ₹450",
      type: "credit",
      date: "Today"
    },

    {
      title:
        "Withdraw Request",
      amount: "- ₹1000",
      type: "debit",
      date: "Yesterday"
    },

    {
      title:
        "Level Bonus",
      amount: "+ ₹800",
      type: "credit",
      date: "2 days ago"
    },

    {
      title:
        "Cashback Reward",
      amount: "+ ₹120",
      type: "credit",
      date: "3 days ago"
    }

  ];

  return (

    <main className="min-h-screen bg-[var(--primary-color)] pb-24">

      {/* HEADER */}

      <div
        className="
          sticky
          top-0
          z-50
          bg-[var(--card-color)]
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
              bg-[var(--primary-color)]
              text-[var(--primary-color)]
            "
          >

            <ArrowLeft size={20} />

          </Link>

          <div>

            <h1 className="text-[24px] font-black text-[var(--primary-color)]">

              MLM Wallet

            </h1>

            <p className="text-[11px] text-[var(--muted-text-color)]">

              Wallet & Transactions

            </p>

          </div>

        </div>

      </div>

      {/* HERO */}

      <section className="px-4 pt-5">

        <div
          className="
            overflow-hidden
            rounded-[32px]
            bg-gradient-to-br
            from-[var(--primary-color)]
            via-[var(--primary-color)]
            to-[var(--primary-color)]
            p-5
            text-[var(--button-text-color)]
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
              bg-[var(--card-color)]/20
            "
          >

            <Wallet size={34} />

          </div>

          <p className="mt-5 text-[13px] text-[var(--button-text-color)]/85">

            Total Wallet Balance

          </p>

          <h2 className="mt-2 text-[42px] font-black">

            ₹12,450

          </h2>

          <p className="mt-3 text-[13px] leading-6 text-[var(--button-text-color)]/90">

            MLM income, cashback aur
            bonus wallet yahan manage hoga.

          </p>

        </div>

      </section>

      {/* WALLET CARDS */}

      <section className="mt-6 px-4">

        <div className="grid grid-cols-2 gap-3">

          <div
            className="
              rounded-2xl
              bg-[var(--card-color)]
              p-4
              shadow-sm
            "
          >

            <BadgeIndianRupee
              size={28}
              className="text-[var(--success-color)]"
            />

            <h3 className="mt-3 text-[24px] font-black">

              ₹8,500

            </h3>

            <p className="text-[12px] text-[var(--muted-text-color)]">

              Withdrawable

            </p>

          </div>

          <div
            className="
              rounded-2xl
              bg-[var(--card-color)]
              p-4
              shadow-sm
            "
          >

            <Gift
              size={28}
              className="text-[var(--primary-color)]"
            />

            <h3 className="mt-3 text-[24px] font-black">

              ₹3,950

            </h3>

            <p className="text-[12px] text-[var(--muted-text-color)]">

              Bonus Wallet

            </p>

          </div>

        </div>

      </section>

      {/* ACTION BUTTONS */}

      <section className="mt-6 px-4">

        <div className="grid grid-cols-2 gap-3">

          <button
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-[var(--primary-color)]
              py-4
              text-[14px]
              font-black
              text-[var(--button-text-color)]
              shadow-lg
            "
          >

            <ArrowDownLeft size={20} />

            Withdraw

          </button>

          <button
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-[var(--warning-color)]
              py-4
              text-[14px]
              font-black
              text-[var(--button-text-color)]
              shadow-lg
            "
          >

            <ArrowUpRight size={20} />

            Transfer

          </button>

        </div>

      </section>

      {/* CARD */}

      <section className="mt-6 px-4">

        <div
          className="
            rounded-[30px]
            bg-gradient-to-r
            from-black
            to-[var(--primary-color)]
            p-5
            text-[var(--button-text-color)]
            shadow-xl
          "
        >

          <div className="flex items-center justify-between">

            <CreditCard size={32} />

            <p className="text-[12px] font-bold">

              JembeeKart Wallet

            </p>

          </div>

          <h2 className="mt-8 text-[28px] font-black tracking-widest">

            **** **** **** 4582

          </h2>

          <div className="mt-5 flex items-center justify-between">

            <div>

              <p className="text-[10px] text-[var(--button-text-color)]/70">

                Card Holder

              </p>

              <h3 className="mt-1 text-[14px] font-black">

                MD ALIM ANSARI

              </h3>

            </div>

            <div>

              <p className="text-[10px] text-[var(--button-text-color)]/70">

                Valid

              </p>

              <h3 className="mt-1 text-[14px] font-black">

                12/30

              </h3>

            </div>

          </div>

        </div>

      </section>

      {/* TRANSACTIONS */}

      <section className="mt-6 px-4">

        <div
          className="
            rounded-[30px]
            bg-[var(--card-color)]
            p-5
            shadow-sm
          "
        >

          <h2 className="text-[22px] font-black">

            Transaction History

          </h2>

          <div className="mt-5 space-y-4">

            {transactions.map(
              (
                transaction,
                index
              ) => (

                <div
                  key={index}
                  className="
                    flex
                    items-center
                    justify-between
                    rounded-2xl
                    bg-[var(--background-color)]
                    p-4
                  "
                >

                  <div>

                    <h3 className="text-[15px] font-black">

                      {transaction.title}

                    </h3>

                    <p className="mt-1 text-[11px] text-[var(--muted-text-color)]">

                      {transaction.date}

                    </p>

                  </div>

                  <div
                    className={`
                      rounded-full
                      px-3
                      py-1
                      text-[12px]
                      font-black
                      ${
                        transaction.type === "credit"
                          ? "bg-[var(--success-color)] text-[var(--success-color)]"
                          : "bg-[var(--danger-color)] text-[var(--danger-color)]"
                      }
                    `}
                  >

                    {transaction.amount}

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
