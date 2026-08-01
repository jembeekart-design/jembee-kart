"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Users, Coins, Bell, Flame } from "lucide-react";
import GlassCard from "./GlassCard";
import { motion } from "framer-motion";

export default function ProductionHeader() {
  const router = useRouter();

  return (
    <header className="pointer-events-auto fixed inset-x-0 top-4 z-50 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="p-2 rounded-full bg-white/6 backdrop-blur-md border border-white/6 shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-extrabold tracking-tight flex items-center gap-2">
            Watch & Earn
            <motion.span
              initial={{ scale: 0.9 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-amber-400"
            >
              <Flame size={16} />
            </motion.span>
          </h2>
        </div>
      </div>

      <nav className="flex items-center gap-3">
        <GlassCard>
          <button aria-label="Search" className="p-2">
            <Search size={18} />
          </button>
        </GlassCard>

        <GlassCard>
          <button aria-label="Friend Search" className="p-2">
            <Users size={18} />
          </button>
        </GlassCard>

        <GlassCard>
          <button aria-label="Coins" className="flex items-center gap-2 px-3 py-1 rounded-full">
            <Coins size={16} className="text-yellow-300" />
            <span className="font-semibold text-sm">0</span>
          </button>
        </GlassCard>

        <GlassCard>
          <button aria-label="Notifications" className="p-2">
            <Bell size={18} />
          </button>
        </GlassCard>
      </nav>
    </header>
  );
}
