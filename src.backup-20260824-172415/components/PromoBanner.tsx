"use client";

import Link from "next/link";

import { useState } from "react";

import {
  Crown,
  Gift,
  Share2,
  Users,
  X
} from "lucide-react";

export default function PromoBanner() {

  const [showBanner, setShowBanner] =
    useState(true);

  if (!showBanner) return null;

  return (

    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-end
        justify-center
        bg-[var(--card-color)]/30
        backdrop-blur-sm
      "
    >

      {/* HALF SCREEN */}

      <div
        className="
          relative
          h-[58vh]
          w-full
          overflow-y-auto
          rounded-t-[35px]
          bg-[var(--card-color)]
          px-5
          pb-6
          pt-5
          text-[var(--text-color)]
          shadow-2xl
        "
      >

        {/* SKIP BUTTON */}

        <button
          onClick={() =>
            setShowBanner(false)
          }
          className="
            absolute
            right-4
            top-4
            z-50
            flex
            items-center
            gap-2
            rounded-full
            border
            border-[var(--border-color)]
            bg-[var(--background-color)]
            px-4
            py-2
            text-[13px]
            font-black
            text-[var(--text-color)]
            shadow-sm
          "
        >

          <X size={16} />

          Skip

        </button>

        {/* TOP */}

        <div className="mt-4 flex items-center gap-3">

          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-full
              bg-[var(--primary-color)]
              text-[var(--primary-color)]
            "
          >

            <Crown size={28} />

          </div>

          <div>

            <h2 className="text-[28px] font-black leading-none text-[var(--primary-color)]">

              JembeeKart

            </h2>

            <p className="mt-1 text-[12px] font-semibold text-[var(--muted-text-color)]">

              MLM • Reseller • Affiliate

            </p>

          </div>

        </div>

        {/* SUBTEXT */}

        <div className="mt-5">

          <h3 className="text-[24px] font-black leading-[30px] text-[var(--text-color)]">

            Start Earning
            <br />
            With Your Network 🚀

          </h3>

          <p className="mt-3 text-[13px] leading-6 text-[var(--muted-text-color)]">

            Invite people, sell products,
            share affiliate links and
            build your own income system
            directly from your phone.

          </p>

        </div>

        {/* FEATURES */}

        <div className="mt-6 space-y-3">

          {/* MLM */}

          <Link href="/mlm">

            <div
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-[var(--primary-color)]
                bg-[var(--primary-color)]
                p-4
                active:scale-[0.98]
                transition
              "
            >

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  bg-[var(--primary-color)]
                  text-[var(--primary-color)]
                "
              >

                <Users size={20} />

              </div>

              <div>

                <h3 className="text-[15px] font-black text-[var(--text-color)]">

                  MLM Income

                </h3>

                <p className="text-[11px] text-[var(--muted-text-color)]">

                  Team build karke earning

                </p>

              </div>

            </div>

          </Link>

          {/* RESELLER */}

          <Link href="/reseller">

            <div
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-[var(--primary-color)]
                bg-[var(--primary-color)]
                p-4
                active:scale-[0.98]
                transition
              "
            >

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  bg-[var(--primary-color)]
                  text-[var(--primary-color)]
                "
              >

                <Gift size={20} />

              </div>

              <div>

                <h3 className="text-[15px] font-black text-[var(--text-color)]">

                  Reseller Program

                </h3>

                <p className="text-[11px] text-[var(--muted-text-color)]">

                  Without stock selling

                </p>

              </div>

            </div>

          </Link>

          {/* AFFILIATE */}

          <Link href="/affiliate">

            <div
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-[var(--warning-color)]
                bg-[var(--warning-color)]
                p-4
                active:scale-[0.98]
                transition
              "
            >

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  bg-[var(--warning-color)]
                  text-[var(--warning-color)]
                "
              >

                <Share2 size={20} />

              </div>

              <div>

                <h3 className="text-[15px] font-black text-[var(--text-color)]">

                  Affiliate Rewards

                </h3>

                <p className="text-[11px] text-[var(--muted-text-color)]">

                  Share links & earn commission

                </p>

              </div>

            </div>

          </Link>

        </div>

        {/* CTA */}

        <button
          className="
            mt-6
            w-full
            rounded-2xl
            bg-gradient-to-r
            from-[var(--primary-color)]
            to-[var(--primary-color)]
            py-3
            text-[15px]
            font-black
            text-[var(--button-text-color)]
            shadow-lg
          "
        >

          Start Earning Now

        </button>

      </div>

    </div>

  );

}
