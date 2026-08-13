"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Users, Coins, Bell, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { useWallet } from "@/hooks/useWallet";

export default function ProductionHeader({ activeTab, setActiveTab }: { activeTab: 'foryou' | 'following', setActiveTab: (tab: 'foryou' | 'following') => void }) {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const { wallet, loading } = useWallet();

  return (
    <>
      <header className="pointer-events-auto fixed inset-x-0 top-0 z-50 flex flex-col pt-safe" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between px-4 h-[56px]">
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
              <span className="font-semibold text-sm">{loading ? '...' : wallet?.walletBalance || 0}</span>
            </button>

            <button onClick={() => router.push('/mlm/notifications')} aria-label="Notifications" className="p-2 rounded-full bg-white/5 backdrop-blur-sm">
              <Bell size={16} />
            </button>
          </nav>
        </div>
        
        {/* Tabs */}
        <div className="flex justify-center gap-4 py-2 bg-black/20 backdrop-blur-sm">
          <button 
            onClick={() => setActiveTab('foryou')}
            className={`font-black ${activeTab === 'foryou' ? 'text-white' : 'text-gray-400'}`}
          >
            For You
          </button>
          <button 
            onClick={() => setActiveTab('following')}
            className={`font-black ${activeTab === 'following' ? 'text-white' : 'text-gray-400'}`}
          >
            Following
          </button>
        </div>
      </header>
    </>
  );
}
