"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {

    const timer = setTimeout(() => {
      setShowBanner(false);
    }, 7000);

    return () => clearTimeout(timer);

  }, []);

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
        bg-black/40
        backdrop-blur-[2px]
      "
    >

      {/* HALF SCREEN BANNER */}

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
          animate-[slideUp_.35s_ease]
        "
      >

        {/* SKIP */}

        <button
          onClick={() =>
            setShowBanner(false)
          }
          className="
            absolute
            right-4
            top-4
            flex
            items-center
            gap-1
            rounded-full
            bg-white/20
            px-3
            py-1.5
            text-[11px]
            font-bold
            backdrop-blur-md
          "
        >

          <X size={14} />

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

            <p className="mt-1 text-[12px] font-semibold text-white/80">

              MLM • Reseller • Affiliate

            </p>

          </div>

        </div>

        {/* SUBTEXT */}

        <div className="mt-5">

          <h3 className="text-[22px] font-black leading-[28px]">

            Start Earning
            <br />
            With Your Network 🚀

          </h3>

          <p className="mt-2 text-[12px] leading-5 text-white/85">

            Invite people, sell products,
            share affiliate links and grow
            your income directly from
            your phone.

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

              <h3 className="text-[14px] font-black">

                MLM Income

              </h3>

              <p className="text-[11px] text-white/80">

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

              <h3 className="text-[14px] font-black">

                Reseller Program

              </h3>

              <p className="text-[11px] text-white/80">

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

              <h3 className="text-[14px] font-black">

                Affiliate Rewards

              </h3>

              <p className="text-[11px] text-white/80">

                Share links & earn commission

              </p>

            </div>

          </div>

        </div>

        {/* BUTTON */}

        <button
          className="
            mt-6
            w-full
            rounded-2xl
            bg-white
            py-3
            text-[14px]
            font-black
            text-violet-700
            shadow-lg
          "
        >

          Start Earning Now

        </button>

        {/* TIMER */}

        <p className="mt-3 text-center text-[10px] font-bold text-white/70">

          Auto close in 7 seconds

        </p>

      </div>

    </div>

  );
}
