"use client";

import Link from "next/link";
import { Users, Flame } from "lucide-react";

export default function FollowersHeader() {
  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-[var(--border-color)] bg-white backdrop-blur-xl">
      <div className="w-full px-4 pb-4 pt-[env(safe-area-inset-top)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="text-teal-500 h-8 w-8" />
          <h1 className="text-2xl font-black text-gray-900">Jembee Shorts</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/profile"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <Users className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
