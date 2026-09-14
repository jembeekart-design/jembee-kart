"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Users,
  Bell,
  Flame,
  Coins,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";

export default function ProductionHeader({
  activeTab,
  setActiveTab,
}: {
  activeTab: "foryou" | "following";
  setActiveTab: (tab: "foryou" | "following") => void;
}) {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-50 pt-safe"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Top glass bar */}
      <div className="pointer-events-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur-xl"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-2 backdrop-blur-xl">
            <span className="text-[15px] font-black tracking-tight text-white">
              Jembee Shorts
            </span>

            <motion.span
              animate={{ scale: [1, 1.12, 1] }}
              transition={{
                repeat: Infinity,
                duration: 2,
              }}
              className="text-orange-400"
            >
              <Flame size={17} fill="currentColor" />
            </motion.span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-xs font-black text-cyan-100 backdrop-blur-xl">
            <Coins size={15} />
            <span>1,250</span>
          </div>

          <button
            onClick={() => setShowSearch(true)}
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white backdrop-blur-xl"
          >
            <Search size={19} />
          </button>

          <button
            onClick={() => router.push("/followers")}
            aria-label="Friends"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white backdrop-blur-xl"
          >
            <Users size={19} />
          </button>

          <button
            onClick={() => router.push("/mlm/notifications")}
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white backdrop-blur-xl"
          >
            <Bell size={19} />

            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-400 px-1 text-[9px] font-black text-black">
              3
            </span>
          </button>
        </div>
      </div>

      {/* Feed tabs */}
      <div className="pointer-events-auto flex justify-center">
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/30 p-1 backdrop-blur-xl">
          <button
            onClick={() => setActiveTab("foryou")}
            className={`rounded-full px-5 py-2 text-sm font-black transition ${
              activeTab === "foryou"
                ? "bg-white text-black shadow-lg"
                : "text-white/65"
            }`}
          >
            For You
          </button>

          <button
            onClick={() => setActiveTab("following")}
            className={`rounded-full px-5 py-2 text-sm font-black transition ${
              activeTab === "following"
                ? "bg-white text-black shadow-lg"
                : "text-white/65"
            }`}
          >
            Following
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="pointer-events-auto absolute left-4 right-4 top-20 rounded-2xl border border-white/10 bg-black/80 p-3 backdrop-blur-2xl">
          <div className="flex items-center gap-2">
            <Search size={18} className="text-cyan-300" />
            <input
              autoFocus
              placeholder="Search videos..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setShowSearch(false);
                }
              }}
            />
            <button
              onClick={() => setShowSearch(false)}
              className="text-xs font-bold text-white/60"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
