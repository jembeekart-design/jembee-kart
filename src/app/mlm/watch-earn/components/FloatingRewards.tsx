"use client";

import {
  Coins
} from "lucide-react";

interface FloatingRewardsProps {

  show: boolean;

  coins: number;

}

export default function
FloatingRewards({
  show,
  coins
}: FloatingRewardsProps) {

  if (!show) {
    return null;
  }

  return (

    <div
      className="
        pointer-events-none
        absolute
        inset-0
        z-[999]
        overflow-hidden
      "
    >

      {/* CENTER REWARD */}

      <div
        className="
          absolute
          left-1/2
          top-1/2
          flex
          -translate-x-1/2
          -translate-y-1/2
          items-center
          gap-3
          rounded-full
          bg-yellow-400
          px-8
          py-4
          shadow-[0_0_50px_rgba(255,215,0,0.8)]
          animate-bounce
        "
      >

        <Coins
          size={34}
          className="
            text-[var(--text-color)]
          "
        />

        <div>

          <h2
            className="
              text-3xl
              font-black
              text-[var(--text-color)]
            "
          >

            +{coins}

          </h2>

          <p
            className="
              text-xs
              font-bold
              text-[var(--text-color)]/70
            "
          >

            Coins Earned

          </p>

        </div>

      </div>

      {/* FLOATING COINS */}

      {[...Array(12)].map(
        (_, index) => (

          <div
            key={index}
            className="
              absolute
              animate-ping
            "
            style={{
              left:
                `${Math.random() * 100}%`,

              top:
                `${Math.random() * 100}%`,

              animationDuration:
                `${
                  1 +
                  Math.random() * 2
                }s`
            }}
          >

            <Coins
              size={
                20 +
                Math.random() * 20
              }
              className="
                text-yellow-300
              "
            />

          </div>
        )
      )}

    </div>
  );
}
