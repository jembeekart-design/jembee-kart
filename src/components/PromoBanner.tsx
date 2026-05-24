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
        bg-black/30
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
          bg-white
          px-5
          pb-6
          pt-5
          text-black
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
            border-gray-200
            bg-gray-100
            px-4
            py-2
            text-[13px]
            font-black
            text-black
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
              bg-violet-100
              text-violet-700
            "
          >

            <Crown size={28} />

          </div>

          <div>

            <h2 className="text-[28px] font-black leading-none text-violet-700">

              JembeeKart

            </h2>

            <p className="mt-1 text-[12px] font-semibold text-gray-500">

              MLM • Reseller • Affiliate

            </p>

          </div>

        </div>

        {/* SUBTEXT */}

        <div className="mt-5">

          <h3 className="text-[24px] font-black leading-[30px] text-black">

            Start Earning
            <br />
            With Your Network 🚀

          </h3>

          <p className="mt-3 text-[13px] leading-6 text-gray-600">

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
                border-violet-100
                bg-violet-50
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
                  bg-violet-200
                  text-violet-700
                "
              >

                <Users size={20} />

              </div>

              <div>

                <h3 className="text-[15px] font-black text-black">

                  MLM Income

                </h3>

                <p className="text-[11px] text-gray-600">

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
                border-pink-100
                bg-pink-50
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
                  bg-pink-200
                  text-pink-700
                "
              >

                <Gift size={20} />

              </div>

              <div>

                <h3 className="text-[15px] font-black text-black">

                  Reseller Program

                </h3>

                <p className="text-[11px] text-gray-600">

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
                border-orange-100
                bg-orange-50
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
                  bg-orange-200
                  text-orange-700
                "
              >

                <Share2 size={20} />

              </div>

              <div>

                <h3 className="text-[15px] font-black text-black">

                  Affiliate Rewards

                </h3>

                <p className="text-[11px] text-gray-600">

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
            from-violet-600
            to-fuchsia-500
            py-3
            text-[15px]
            font-black
            text-white
            shadow-lg
          "
        >

          Start Earning Now

        </button>

      </div>

    </div>

  );

}
