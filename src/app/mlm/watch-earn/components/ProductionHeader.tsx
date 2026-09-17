"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/config";
import { subscribeToShortsUnreadCount } from "@/firestore/services/shortsNotificationService";
import {
  Search,
  UserPlus,
  Bell,
  Flame,
  X,
} from "lucide-react";
import ShortsSearch from "./ShortsSearch";

export default function ProductionHeader({
  activeTab,
  setActiveTab,
}: {
  activeTab: "foryou" | "following";
  setActiveTab: (tab: "foryou" | "following") => void;
}) {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setUnreadCount(0);
        return;
      }

      return subscribeToShortsUnreadCount(
        user.uid,
        setUnreadCount,
        () => setUnreadCount(0)
      );
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <>
      <header
        className="pointer-events-none fixed inset-x-0 top-0 z-50 text-white"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="pointer-events-auto px-5 pt-4">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-1">
                <span className="text-[25px] font-extrabold leading-none tracking-tight">
                  Jembee
                </span>
                <span className="text-[25px] font-extrabold leading-none tracking-tight text-cyan-300">
                  Shorts
                </span>
                <Flame
                  size={23}
                  fill="currentColor"
                  className="ml-0.5 text-orange-400"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-[52px] items-center rounded-full bg-black/20 p-1 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setActiveTab("foryou")}
                    className={`h-[44px] rounded-full px-7 text-[13px] font-bold whitespace-nowrap ${
                      activeTab === "foryou"
                        ? "bg-gradient-to-r from-cyan-400 to-teal-400 text-white shadow-[0_0_20px_rgba(34,211,238,0.35)]"
                        : "text-white/80"
                    }`}
                  >
                    For You
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("following")}
                    className={`h-[44px] rounded-full px-7 text-[13px] font-bold whitespace-nowrap ${
                      activeTab === "following"
                        ? "bg-gradient-to-r from-cyan-400 to-teal-400 text-white shadow-[0_0_20px_rgba(34,211,238,0.35)]"
                        : "text-white/80"
                    }`}
                  >
                    Following
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSearch(true)}
                aria-label="Search"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-black/20 backdrop-blur-md"
              >
                <Search size={25} />
              </button>
              <button
                type="button"
                onClick={() => router.push("/followers")}
                aria-label="Friends"
                className="relative flex h-11 w-11 items-center justify-center rounded-full bg-black/20 backdrop-blur-md"
              >
                <UserPlus size={25} strokeWidth={2} />
                <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-pink-500" />
              </button>
              <button
                type="button"
                onClick={() => router.push("/mlm/watch-earn/notifications")}
                aria-label="Notifications"
                className="relative flex h-11 w-11 items-center justify-center rounded-full bg-black/20 backdrop-blur-md"
              >
                <Bell size={25} strokeWidth={2} />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-extrabold">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      {showSearch && <ShortsSearch onClose={() => setShowSearch(false)} />}
    </>
  );
}
