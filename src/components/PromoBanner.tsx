"use client";

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
        bg-black/50
        backdrop-blur-sm
      "
    >

      {/* HALF SCREEN */}

      <div
        className="
          relative
          h-[58vh]
          w-full
          overflow-hidden
          rounded-t-[35px]
          bg-gradient-to-br
          from-violet-700
          via-fuchsia-600
          to-orange-500
          px-5
          pb-6
          pt-5
          text-white
          shadow-2xl
        "
      >

        {/* CLEAR SKIP BUTTON */}

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
            bg-white
            px-4
            py-2
            text-[13px]
            font-black
            text-black
            shadow-xl
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
              bg-white/20
            "
          >

            <Crown size={28} />

          </div>

          <div>

            <h2 className="text-[28px] font-black leading-none">

              JembeeKart

            </h2>

            <p className="mt-1 text-[12px] font-semibold text-white/90">

              MLM • Reseller • Affiliate

            </p>

          </div>

        </div>

        {/* SUBTEXT */}

        <div className="mt-5">

          <h3 className="text-[24px] font-black leading-[30px]">

            Start Earning
            <br />
            With Your Network 🚀

          </h3>

          <p className="mt-2 text-[13px] leading-6 text-white/90">

            Invite people, sell products,
            share affiliate links and
            build your own income system
            directly from your phone.

          </p>

        </div>

        {/* FEATURES */}

        <div className="mt-6 space-y-3">

          <div
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              bg-white/10
              p-3
              backdrop-blur-md
            "
          >

            <Users size={20} />

            <div>

              <h3 className="text-[15px] font-black">

                MLM Income

              </h3>

              <p className="text-[11px] text-white/85">

                Team build karke earning

              </p>

            </div>

          </div>

          <div
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              bg-white/10
              p-3
              backdrop-blur-md
            "
          >

            <Gift size={20} />

            <div>

              <h3 className="text-[15px] font-black">

                Reseller Program

              </h3>

              <p className="text-[11px] text-white/85">

                Without stock selling

              </p>

            </div>

          </div>

          <div
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              bg-white/10
              p-3
              backdrop-blur-md
            "
          >

            <Share2 size={20} />

            <div>

              <h3 className="text-[15px] font-black">

                Affiliate Rewards

              </h3>

              <p className="text-[11px] text-white/85">

                Share links & earn commission

              </p>

            </div>

          </div>

        </div>

        {/* CTA */}

        <button
          className="
            mt-6
            w-full
            rounded-2xl
            bg-white
            py-3
            text-[15px]
            font-black
            text-violet-700
            shadow-lg
          "
        >

          Start Earning Now

        </button>

      </div>

    </div>

  );

}
