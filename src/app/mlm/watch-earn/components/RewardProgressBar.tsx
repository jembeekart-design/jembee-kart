"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";

interface RewardProgressBarProps {
  watchedVideos: number;
  requiredVideos: number;

  qualifiedSales: number;
  requiredSales: number;

  lockedReward: number;

  cycleNumber: number;

  status: "active" | "pending" | "completed";
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
  const [open, setOpen] = useState(false);

  const videoProgress =
    requiredVideos > 0 ? Math.min((watchedVideos / requiredVideos) * 100, 100) : 0;

  const salesProgress =
    requiredSales > 0 ? Math.min((qualifiedSales / requiredSales) * 100, 100) : 0;

  const totalProgress = (videoProgress + salesProgress) / 2;

  const statusConfig = {
    active: { label: "Watching", className: "text-[var(--primary-color)] bg-[var(--primary-color)]/10" },
    pending: { label: "Waiting", className: "text-[var(--warning-color)] bg-[var(--warning-color)]/10" },
    completed: { label: "Unlocked", className: "text-[var(--success-color)] bg-[var(--success-color)]/10" },
  } as const;

  const currentStatus = statusConfig[status];

  return (
    <>
      {/* Compact bottom overlay (reels style) */}
      <div className="pointer-events-auto absolute left-4 right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 flex items-end justify-center">
        <div className="w-full max-w-3xl">
          <div className="flex items-center justify-between gap-3">
            <button
              aria-label="Open reward details"
              onClick={() => setOpen(true)}
              className="flex items-center gap-3 rounded-full bg-black/40 px-3 py-2 backdrop-blur-md border border-white/6 shadow-md"
            >
              <div className="flex flex-col">
                <span className="text-xs text-[var(--button-text-color)]/70">Cycle #{cycleNumber}</span>
                <span className="text-sm font-bold text-[var(--button-text-color)]">₹{lockedReward}</span>
              </div>

              <div className={`rounded-full px-2 py-1 text-xs font-semibold ${currentStatus.className}`}>
                {currentStatus.label}
              </div>
            </button>

            <div className="flex items-center gap-2">
              <button
                aria-label="Upload video"
                className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white/6 px-3 py-2 text-sm font-semibold backdrop-blur-md"
              >
                Upload
              </button>

              <button
                aria-label="Use audio"
                className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white/6 px-3 py-2 text-sm font-semibold backdrop-blur-md"
              >
                Use Audio
              </button>
            </div>
          </div>

          {/* Reward progress (thin) */}
          <div className="mt-2 h-2 w-full rounded-full bg-white/8 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${totalProgress}%` }}
              transition={{ duration: 0.35 }}
              className="h-full rounded-full bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)]"
            />
          </div>

          {/* Video progress (very thin) */}
          <div className="mt-1 h-1 w-full rounded-full bg-white/6 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${videoProgress}%` }}
              transition={{ duration: 0.2 }}
              className="h-full rounded-full bg-white"
            />
          </div>
        </div>
      </div>

      {/* Bottom sheet details */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-60 flex items-end">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-3xl rounded-t-3xl bg-[var(--card-color)] p-4 pt-6 backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--button-text-color)]">Reward Cycle #{cycleNumber}</h3>
                  <p className="text-xs text-[var(--text-color)]">Unlock ₹{lockedReward} by completing the requirements.</p>
                </div>

                <button aria-label="Close" onClick={() => setOpen(false)} className="p-2 rounded-full bg-white/4">
                  <ChevronUp size={18} className="rotate-180" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-[var(--button-text-color)]/70">
                    <span>Videos Watched</span>
                    <span className="font-semibold text-[var(--button-text-color)]">{watchedVideos}/{requiredVideos}</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-white/6 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${videoProgress}%` }} transition={{ duration: 0.35 }} className="h-full rounded-full bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)]" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-[var(--button-text-color)]/70">
                    <span>Delivered Sales</span>
                    <span className="font-semibold text-[var(--button-text-color)]">{qualifiedSales}/{requiredSales}</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-white/6 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${salesProgress}%` }} transition={{ duration: 0.35 }} className="h-full rounded-full bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)]" />
                  </div>
                </div>

                <div className="pt-2 border-t border-white/6">
                  <button className="w-full rounded-full bg-[var(--primary-color)] px-4 py-2 text-sm font-bold text-black">Claim / View Reward</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
