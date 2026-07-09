"use client";

import { motion } from "framer-motion";

interface RewardProgressBarProps {
  watchedVideos: number;
  requiredVideos: number;

  qualifiedSales: number;
  requiredSales: number;

  lockedReward: number;

  cycleNumber: number;

  status:
    | "active"
    | "pending"
    | "completed";
}

export default function RewardProgressBar({
  watchedVideos,
  requiredVideos,

  qualifiedSales,
  requiredSales,

  lockedReward,

  cycleNumber,

  status,
}: RewardProgressBarProps) {
  const videoProgress =
    requiredVideos > 0
      ? Math.min(
          (watchedVideos /
            requiredVideos) *
            100,
          100
        )
      : 0;

  const salesProgress =
    requiredSales > 0
      ? Math.min(
          (qualifiedSales /
            requiredSales) *
            100,
          100
        )
      : 0;

  const totalProgress =
    (
      videoProgress +
      salesProgress
    ) / 2;

  const statusConfig = {
    active: {
      label: "Watching",
      className:
        "theme-primary-bg/20 text-blue-300 border theme-primary-border/20",
    },

    pending: {
      label:
        "Waiting For Sales",
      className:
        "bg-[var(--warning-color)]/20 text-yellow-300 border border-yellow-400/20",
    },

    completed: {
      label:
        "Reward Unlocked",
      className:
        "bg-[var(--success-color)]/20 text-green-300 border border-green-400/20",
    },
  };

  const currentStatus =
    statusConfig[status];

  return (
    <div
      className="
        absolute
        left-4
        right-4
        top-4
        z-50
      "
    >
      <div
        className="
          overflow-hidden
          rounded-3xl
          border
          border-white/10
          bg-black/60
          p-4
          backdrop-blur-xl
          shadow-xl
        "
      >
        {/* Header */}

        <div
          className="
            mb-4
            flex
            items-center
            justify-between
          "
        >
          <div>
            <p
              className="
                text-[10px]
                uppercase
                tracking-wider
                text-[var(--button-text-color)]/60
              "
            >
              Reward Cycle
            </p>

            <h3
              className="
                text-sm
                font-bold
                text-[var(--button-text-color)]
              "
            >
              Cycle #
              {cycleNumber}
            </h3>
          </div>

          <div
            className="
              rounded-full
              bg-[var(--warning-color)]/20
              px-3
              py-1
              text-xs
              font-bold
              text-yellow-300
              border
              border-yellow-500/20
            "
          >
            ₹{lockedReward} Locked
          </div>
        </div>

        {/* Reward Box */}

        <div
          className="
            mb-4
            rounded-2xl
            border
            border-white/10
            bg-[var(--card-color)]/5
            p-3
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
            "
          >
            <span
              className="
                text-xs
                text-[var(--button-text-color)]/70
              "
            >
              Reward
            </span>

            <span
              className="
                text-sm
                font-black
                text-yellow-300
              "
            >
              ₹{lockedReward}
            </span>
          </div>

          <p
            className="
              mt-1
              text-[11px]
              text-[var(--button-text-color)]/50
            "
          >
            Unlock after{" "}
            {requiredSales} delivered
            sales.
          </p>
        </div>

        {/* Video Progress */}

        <div className="mb-4">
          <div
            className="
              mb-1
              flex
              items-center
              justify-between
              text-xs
            "
          >
            <span
              className="
                text-[var(--button-text-color)]
                font-medium
              "
            >
              Videos Watched
            </span>

            <span
              className="
                text-yellow-300
                font-bold
              "
            >
              {watchedVideos}/
              {requiredVideos}
            </span>
          </div>

          <div
            className="
              h-2.5
              overflow-hidden
              rounded-full
              bg-[var(--card-color)]/10
            "
          >
            <motion.div
              initial={{
                width: 0,
              }}
              animate={{
                width:
                  `${videoProgress}%`,
              }}
              transition={{
                duration: 0.5,
              }}
              className="
                h-full
                rounded-full
                bg-gradient-to-r
                from-yellow-400
                to-orange-500
              "
            />
          </div>
        </div>

        {/* Sales Progress */}

        <div className="mb-4">
          <div
            className="
              mb-1
              flex
              items-center
              justify-between
              text-xs
            "
          >
            <span
              className="
                text-[var(--button-text-color)]
                font-medium
              "
            >
              Delivered Sales
            </span>

            <span
              className="
                text-green-300
                font-bold
              "
            >
              {qualifiedSales}/
              {requiredSales}
            </span>
          </div>

          <div
            className="
              h-2.5
              overflow-hidden
              rounded-full
              bg-[var(--card-color)]/10
            "
          >
            <motion.div
              initial={{
                width: 0,
              }}
              animate={{
                width:
                  `${salesProgress}%`,
              }}
              transition={{
                duration: 0.5,
              }}
              className="
                h-full
                rounded-full
                bg-gradient-to-r
                from-green-400
                to-emerald-500
              "
            />
          </div>
        </div>

        {/* Status */}

        <div
          className="
            mb-4
            flex
            items-center
            justify-between
          "
        >
          <span
            className="
              text-xs
              text-[var(--button-text-color)]/60
            "
          >
            Status
          </span>

          <div
            className={`
              rounded-full
              px-3
              py-1
              text-xs
              font-bold
              ${currentStatus.className}
            `}
          >
            {
              currentStatus.label
            }
          </div>
        </div>

        {/* Overall Progress */}

        <div>
          <div
            className="
              mb-1
              flex
              items-center
              justify-between
              text-xs
            "
          >
            <span
              className="
                text-[var(--button-text-color)]/70
              "
            >
              Overall Progress
            </span>

            <span
              className="
                font-bold
                text-[var(--button-text-color)]
              "
            >
              {Math.floor(
                totalProgress
              )}
              %
            </span>
          </div>

          <div
            className="
              h-3
              overflow-hidden
              rounded-full
              bg-[var(--card-color)]/10
            "
          >
            <motion.div
              initial={{
                width: 0,
              }}
              animate={{
                width:
                  `${totalProgress}%`,
              }}
              transition={{
                duration: 0.5,
              }}
              className="
                h-full
                rounded-full
                bg-gradient-to-r
                from-yellow-400
                via-orange-400
                to-green-500
              "
            />
          </div>
        </div>
      </div>
    </div>
  );
}
