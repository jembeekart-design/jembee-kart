"use client";

import React from "react";
import { UploadCloud, Gift, Music } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BottomQuickActions() {
  const router = useRouter();

  return (
    <div className="pointer-events-auto fixed bottom-4 left-0 right-0 z-50 flex items-center justify-center px-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex w-full max-w-md items-center justify-center gap-3">
        <button
          onClick={() => router.push("/mlm/watch-earn/upload")}
          className="flex items-center gap-2 rounded-full bg-white/6 px-3 py-2 text-sm font-semibold backdrop-blur-sm"
          aria-label="Upload video"
        >
          <UploadCloud size={14} />
          <span className="hidden sm:inline">Upload</span>
        </button>

        <button
          className="flex items-center gap-2 rounded-full bg-white/6 px-3 py-2 text-sm font-semibold backdrop-blur-sm"
          aria-label="Earn more"
        >
          <Gift size={14} />
          <span className="hidden sm:inline">Earn</span>
        </button>

        <button
          className="flex items-center gap-2 rounded-full bg-white/6 px-3 py-2 text-sm font-semibold backdrop-blur-sm"
          aria-label="Use audio"
        >
          <Music size={14} />
          <span className="hidden sm:inline">Audio</span>
        </button>
      </div>
    </div>
  );
}
