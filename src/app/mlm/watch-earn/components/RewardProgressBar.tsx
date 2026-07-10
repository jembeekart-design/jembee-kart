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
        "theme-primary-bg/20 text-[var(--primary-color)] border theme-primary-border/20",
    },

    pending: {
      label:
        "Waiting For Sales",
      className:
        "bg-[var(--warning-color)]/20 text-[var(--warning-color)] border border-[var(--warning-color)]/20",
    },

    completed: {
      label:
        "Reward Unlocked",
      className:
        "bg-[var(--success-color)]/20 text-[var(--success-color)] border border-[var(--success-color)]/20",
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
          border-[var(--border-color)]/10
          bg-[var(--card-color)]/60
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
              text-[var(--warning-color)]
              border
              border-[var(--warning-color)]/20
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
            border-[var(--border-color)]/10
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
                text-[var(--warning-color)]
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
                text-[var(--warning-color)]
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
                from-[var(--primary-color)]
                to-[var(--primary-color)]
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
                text-[var(--success-color)]
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
                from-[var(--primary-color)]
                to-[var(--primary-color)]
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
                from-[var(--primary-color)]
                via-[var(--primary-color)]
                to-[var(--primary-color)]
              "
            />
          </div>
        </div>
      </div>
    </div>
  );
}
