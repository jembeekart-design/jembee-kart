"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Users, Coins, Bell, Flame } from "lucide-react";
import GlassCard from "./GlassCard";
import { motion } from "framer-motion";

export default function ProductionHeader() {
  const router = useRouter();

  return (
    <header className="pointer-events-auto fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 h-[56px]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="p-2 rounded-full bg-white/6 backdrop-blur-sm border border-white/6 shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>

        <h2 className="text-base font-extrabold tracking-tight flex items-center gap-2">
          Watch & Earn
          <motion.span
            initial={{ scale: 0.95 }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-amber-400"
          >
            <Flame size={14} />
          </motion.span>
        </h2>
      </div>

      <nav className="flex items-center gap-2">
        <button aria-label="Search" className="p-2 rounded-full bg-white/5 backdrop-blur-sm">
          <Search size={16} />
        </button>

        <button aria-label="Friends" className="p-2 rounded-full bg-white/5 backdrop-blur-sm">
          <Users size={16} />
        </button>

        <button aria-label="Coins" className="flex items-center gap-2 rounded-full bg-white/5 px-2 py-1">
          <Coins size={14} className="text-yellow-300" />
          <span className="font-semibold text-sm">0</span>
        </button>

        <button aria-label="Notifications" className="p-2 rounded-full bg-white/5 backdrop-blur-sm">
          <Bell size={16} />
        </button>
      </nav>
    </header>
  );
}
