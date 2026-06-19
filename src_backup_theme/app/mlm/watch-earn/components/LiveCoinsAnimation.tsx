"use client";

import {
  motion,
  AnimatePresence
} from "framer-motion";

import { Coins }
from "lucide-react";

interface LiveCoinsAnimationProps {

  show: boolean;

  coins: number;

}

export default function
LiveCoinsAnimation({
  show,
  coins
}: LiveCoinsAnimationProps) {

  return (

    <AnimatePresence>

      {show && (

        <motion.div
          initial={{
            opacity: 0,
            y: 100,
            scale: 0.5
          }}

          animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }}

          exit={{
            opacity: 0,
            y: -120,
            scale: 0.5
          }}

          transition={{
            duration: 0.6
          }}

          className="
            fixed
            bottom-32
            left-1/2
            z-[999]
            flex
            -translate-x-1/2
            items-center
            gap-3
            rounded-full
            border
            border-yellow-300
            bg-yellow-400
            px-6
            py-3
            shadow-2xl
          "
        >

          <motion.div
            animate={{
              rotate: 360
            }}

            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "linear"
            }}
          >

            <Coins
              size={28}
              className="
                text-black
              "
            />

          </motion.div>

          <div>

            <h2
              className="
                text-xl
                font-black
                text-black
              "
            >

              +{coins} Coins

            </h2>

            <p
              className="
                text-xs
                font-bold
                text-black/70
              "
            >

              Watching Reward Added

            </p>

          </div>

        </motion.div>
      )}

    </AnimatePresence>
  );
}
