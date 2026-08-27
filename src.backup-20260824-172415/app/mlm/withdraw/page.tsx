"use client";

import { useState } from "react";

import Link from "next/link";

import {
  ArrowLeft,
  BadgeIndianRupee,
  Building2,
  Clock3,
  Wallet
} from "lucide-react";

export default function WithdrawPage() {

  const [amount, setAmount] =
    useState("");

  const [upi, setUpi] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const walletBalance =
    4520;

  async function requestWithdraw() {

    if (
      !amount ||
      !upi
    ) {

      alert(
        "Please fill all fields"
      );

      return;
    }

    if (
      Number(amount) <
      100
    ) {

      alert(
        "Minimum withdraw ₹100"
      );

      return;
    }

    setLoading(true);

    setTimeout(() => {

      setLoading(false);

      alert(
        "Withdraw Request Submitted"
      );

      setAmount("");
      setUpi("");

    }, 2000);

  }

  return (

    <main className="min-h-screen bg-[var(--color-page-background)] pb-24">

      {/* HEADER */}

      <div
        className="
          sticky
          top-0
          z-50
          bg-[var(--color-card-background)]
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
              bg-[var(--color-primary-button)]
              text-[var(--color-primary-button)]
            "
          >

            <ArrowLeft size={20} />

          </Link>

          <div>

            <h1 className="text-[24px] font-black text-[var(--color-primary-button)]">

              Withdraw

            </h1>

            <p className="text-[11px] text-[var(--text-secondary)]">

              Withdraw MLM Earnings

            </p>

          </div>

        </div>

      </div>

      {/* BALANCE */}

      <section className="px-4 pt-5">

        <div
          className="
            overflow-hidden
            rounded-[30px]
            bg-gradient-to-br
            from-[var(--color-primary-button)]
            via-[var(--color-primary-button)]
            to-[var(--color-primary-button)]
            p-5
            text-[var(--button-text-color)]
            shadow-xl
          "
        >

          <Wallet size={40} />

          <p className="mt-5 text-[13px] text-[var(--button-text-color)]/80">

            Available Balance

          </p>

          <h2 className="mt-2 text-[38px] font-black">

            ₹{walletBalance}

          </h2>

          <p className="mt-2 text-[12px] text-[var(--button-text-color)]/85">

            Withdraw anytime to your
            bank or UPI account.

          </p>

        </div>

      </section>

      {/* FORM */}

      <section className="mt-6 px-4">

        <div
          className="
            rounded-[28px]
            bg-[var(--color-card-background)]
            p-5
            shadow-sm
          "
        >

          <h2 className="text-[22px] font-black">

            Withdraw Request

          </h2>

          {/* AMOUNT */}

          <div className="mt-5">

            <label className="text-[13px] font-black">

              Withdraw Amount

            </label>

            <div
              className="
                mt-2
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-[var(--color-border)]
                bg-[var(--color-page-background)]
                px-4
                py-3
              "
            >

              <BadgeIndianRupee
                size={18}
                className="text-[var(--color-primary-button)]"
              />

              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) =>
                  setAmount(
                    e.target.value
                  )
                }
                className="
                  w-full
                  bg-transparent
                  text-[14px]
                  outline-none
                "
              />

            </div>

          </div>

          {/* UPI */}

          <div className="mt-5">

            <label className="text-[13px] font-black">

              UPI ID

            </label>

            <div
              className="
                mt-2
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-[var(--color-border)]
                bg-[var(--color-page-background)]
                px-4
                py-3
              "
            >

              <Building2
                size={18}
                className="text-[var(--color-primary-button)]"
              />

              <input
                type="text"
                placeholder="example@upi"
                value={upi}
                onChange={(e) =>
                  setUpi(
                    e.target.value
                  )
                }
                className="
                  w-full
                  bg-transparent
                  text-[14px]
                  outline-none
                "
              />

            </div>

          </div>

          {/* BUTTON */}

          <button
            onClick={requestWithdraw}
            disabled={loading}
            className="
              mt-7
              w-full
              rounded-2xl
              bg-gradient-to-r
              from-[var(--color-primary-button)]
              to-[var(--color-primary-button)]
              py-3
              text-[15px]
              font-black
              text-[var(--button-text-color)]
              shadow-lg
            "
          >

            {loading
              ? "Processing..."
              : "Withdraw Now"}

          </button>

        </div>

      </section>

      {/* HISTORY */}

      <section className="mt-6 px-4">

        <div
          className="
            rounded-[28px]
            bg-[var(--color-card-background)]
            p-5
            shadow-sm
          "
        >

          <h2 className="text-[22px] font-black">

            Withdraw History

          </h2>

          <div className="mt-5 space-y-3">

            {/* ITEM */}

            <div
              className="
                flex
                items-center
                justify-between
                rounded-2xl
                bg-[var(--color-page-background)]
                p-4
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
                    bg-[var(--color-success)]
                    text-[var(--color-success)]
                  "
                >

                  <Wallet size={22} />

                </div>

                <div>

                  <h3 className="text-[15px] font-black">

                    ₹1500 Withdraw

                  </h3>

                  <p className="text-[11px] text-[var(--text-secondary)]">

                    Success

                  </p>

                </div>

              </div>

              <div
                className="
                  rounded-full
                  bg-[var(--color-success)]
                  px-3
                  py-1
                  text-[11px]
                  font-black
                  text-[var(--color-success)]
                "
              >

                Paid

              </div>

            </div>

            {/* ITEM */}

            <div
              className="
                flex
                items-center
                justify-between
                rounded-2xl
                bg-[var(--color-page-background)]
                p-4
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
                    bg-[var(--color-warning)]
                    text-[var(--color-warning)]
                  "
                >

                  <Clock3 size={22} />

                </div>

                <div>

                  <h3 className="text-[15px] font-black">

                    ₹800 Withdraw

                  </h3>

                  <p className="text-[11px] text-[var(--text-secondary)]">

                    Pending Approval

                  </p>

                </div>

              </div>

              <div
                className="
                  rounded-full
                  bg-[var(--color-warning)]
                  px-3
                  py-1
                  text-[11px]
                  font-black
                  text-[var(--color-warning)]
                "
              >

                Pending

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>

  );

}
