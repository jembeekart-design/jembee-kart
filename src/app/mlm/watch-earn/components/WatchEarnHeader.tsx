"use client";

import {
  Coins,
  Flame,
  Bell
} from "lucide-react";

interface WatchEarnHeaderProps {

  totalCoins: number;

  streak: number;

}

export default function
WatchEarnHeader({
  totalCoins,
  streak
}: WatchEarnHeaderProps) {

  return (

    <header
      className="
        fixed
        left-0
        right-0
        top-0
        z-50
        flex
        items-center
        justify-between
        px-4
        py-4
      "
    >

      {/* LEFT */}

      <div>

        <h1
          className="
            text-3xl
            font-black
            text-[var(--button-text-color)]
          "
        >

          Watch & Earn

        </h1>

        <p
          className="
            mt-1
            text-xs
            font-semibold
            text-gray-300
          "
        >

          Watch videos & earn rewards

        </p>

      </div>

      {/* RIGHT */}

      <div
        className="
          flex
          items-center
          gap-3
        "
      >

        {/* STREAK */}

        <div
          className="
            flex
            items-center
            gap-2
            rounded-full
            border
            border-orange-400/40
            bg-orange-500/20
            px-4
            py-2
            backdrop-blur-xl
          "
        >

          <Flame
            size={18}
            className="
              text-orange-400
            "
          />

          <span
            className="
              text-sm
              font-black
              text-[var(--button-text-color)]
            "
          >

            {streak}

          </span>

        </div>

        {/* COINS */}

        <div
          className="
            flex
            items-center
            gap-2
            rounded-full
            border
            border-yellow-300/40
            bg-yellow-400/20
            px-4
            py-2
            backdrop-blur-xl
          "
        >

          <Coins
            size={18}
            className="
              text-yellow-300
            "
          />

          <span
            className="
              text-sm
              font-black
              text-[var(--button-text-color)]
            "
          >

            {totalCoins}

          </span>

        </div>

        {/* NOTIFICATION */}

        <button
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            border
            border-white/10
            bg-black/30
            text-[var(--button-text-color)]
            backdrop-blur-xl
          "
        >

          <Bell size={20} />

        </button>

      </div>

    </header>
  );
}
