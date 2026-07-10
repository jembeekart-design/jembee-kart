"use client";

import {
  motion,
  AnimatePresence
} from "framer-motion";

import { Coins } from "lucide-react";

interface CoinsPopupProps {
  show: boolean;

  coins: number;
}

export default function
CoinsPopup({
  show,
  coins
}: CoinsPopupProps) {

  return (

    <AnimatePresence>

      {show && (

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.5,
            y: 50
          }}

          animate={{
            opacity: 1,
            scale: 1,
            y: 0
          }}

          exit={{
            opacity: 0,
            scale: 0.5,
            y: -50
          }}

          transition={{
            duration: 0.4
          }}

          className="
            fixed
            left-1/2
            top-1/2
            z-[999]
            flex
            -translate-x-1/2
            -translate-y-1/2
            items-center
            gap-3
            rounded-3xl
            bg-[var(--warning-color)]
            px-6
            py-4
            shadow-2xl
          "
        >

          <Coins
            size={32}
            className="
              text-[var(--text-color)]
            "
          />

          <div>

            <h2
              className="
                text-2xl
                font-black
                text-[var(--text-color)]
              "
            >

              +{coins} Coins

            </h2>

            <p
              className="
                text-sm
                font-bold
                text-[var(--text-color)]/70
              "
            >

              Reward Added

            </p>

          </div>

        </motion.div>
      )}

    </AnimatePresence>
  );
}
