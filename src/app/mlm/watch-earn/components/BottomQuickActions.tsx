"use client";

import React from "react";
import { UploadCloud, Gift, Music } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BottomQuickActions() {
  const router = useRouter();

  return (
    <div className="pointer-events-auto fixed bottom-6 left-0 right-0 z-50 flex items-center justify-center px-4">
      <div className="flex w-full max-w-md items-center justify-between gap-3">
        <button
          onClick={() => router.push("/mlm/watch-earn/upload")}
          className="flex items-center gap-2 rounded-full bg-white/6 px-4 py-2 text-sm font-semibold backdrop-blur-md"
        >
          <UploadCloud size={16} />
          Upload Video
        </button>

        <button className="flex items-center gap-2 rounded-full bg-white/6 px-4 py-2 text-sm font-semibold backdrop-blur-md">
          <Gift size={16} />
          Earn More
        </button>

        <button className="flex items-center gap-2 rounded-full bg-white/6 px-4 py-2 text-sm font-semibold backdrop-blur-md">
          <Music size={16} />
          Use Audio
        </button>
      </div>
    </div>
  );
}
