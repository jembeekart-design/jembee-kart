"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Users, Coins, Bell, Flame, X } from "lucide-react";
import GlassCard from "./GlassCard";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductionHeader() {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
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
          <button onClick={() => setShowSearch(true)} aria-label="Search" className="p-2 rounded-full bg-white/5 backdrop-blur-sm">
            <Search size={16} />
          </button>

          <button onClick={() => router.push('/mlm/team-business')} aria-label="Friends" className="p-2 rounded-full bg-white/5 backdrop-blur-sm">
            <Users size={16} />
          </button>

          <button onClick={() => router.push('/mlm/wallet')} aria-label="Coins" className="flex items-center gap-2 rounded-full bg-white/5 px-2 py-1">
            <Coins size={14} className="text-yellow-300" />
            <span className="font-semibold text-sm">0</span>
          </button>

          <button onClick={() => router.push('/mlm/notifications')} aria-label="Notifications" className="p-2 rounded-full bg-white/5 backdrop-blur-sm">
            <Bell size={16} />
          </button>
        </nav>
      </header>

      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm p-4"
          >
            <div className="flex items-center gap-2 mt-safe">
              <input 
                autoFocus
                placeholder="Search videos..." 
                className="flex-1 bg-white/10 p-3 rounded-full outline-none text-white placeholder:text-white/50"
              />
              <button onClick={() => setShowSearch(false)}><X /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
