"use client";

import {
  motion
} from "framer-motion";

interface RewardProgressBarProps {

  progress: number;

  coins: number;

}

export default function
RewardProgressBar({
  progress,
  coins
}: RewardProgressBarProps) {

  return (

    <div
      className="
        absolute
        left-4
        right-4
        top-24
        z-50
      "
    >

      <div
        className="
          mb-2
          flex
          items-center
          justify-between
          text-white
        "
      >

        <span
          className="
            text-xs
            font-bold
          "
        >

          Watch to Earn

        </span>

        <span
          className="
            rounded-full
            bg-black/50
            px-3
            py-1
            text-xs
            font-black
            text-yellow-400
          "
        >

          +{coins} Coins

        </span>

      </div>

      <div
        className="
          h-3
          overflow-hidden
          rounded-full
          bg-white/20
          backdrop-blur
        "
      >

        <motion.div
          initial={{
            width: 0
          }}

          animate={{
            width:
              `${progress}%`
          }}

          transition={{
            duration: 0.3
          }}

          className="
            h-full
            rounded-full
            bg-gradient-to-r
            from-yellow-300
            via-yellow-400
            to-orange-500
          "
        />

      </div>

    </div>
  );
}
