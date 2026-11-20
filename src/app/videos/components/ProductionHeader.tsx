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

export default function ProductionHeader() {
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
        <div className="pointer-events-auto bg-gradient-to-b from-[#090611]/90 via-[#090611]/45 to-transparent px-4 pb-3 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 flex-col">
              <div className="flex items-center gap-1">
                <span className="text-[23px] font-extrabold leading-none tracking-tight">
                  Jembee
                </span>
                <span className="text-[25px] font-extrabold leading-none tracking-tight text-pink-300">
                  Shorts
                </span>
                <Flame
                  size={23}
                  fill="currentColor"
                  className="ml-0.5 text-pink-300"
                />
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSearch(true)}
                aria-label="Search"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/35 shadow-sm backdrop-blur-xl"
              >
                <Search size={25} />
              </button>
              <button
                type="button"
                onClick={() => router.push("/followers")}
                aria-label="Friends"
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-amber-200/20 bg-[#071329]/55 shadow-[0_4px_18px_rgba(0,0,0,0.28)] backdrop-blur-xl"
              >
                <UserPlus size={25} strokeWidth={2} />
                <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-amber-400" />
              </button>
              <button
                type="button"
                onClick={() => router.push("/videos/notifications")}
                aria-label="Notifications"
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-amber-200/20 bg-[#071329]/55 shadow-[0_4px_18px_rgba(0,0,0,0.28)] backdrop-blur-xl"
              >
                <Bell size={25} strokeWidth={2} />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-extrabold">
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
