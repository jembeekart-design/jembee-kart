"use client";

import React from "react";
import { UploadCloud, Gift, Music, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { WatchVideo } from "../services/watchVideos.service";

export default function BottomQuickActions({ video }: { video?: WatchVideo }) {
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
          onClick={() => router.push("/mlm/watch-earn/reward-center")}
          className="flex items-center gap-2 rounded-full bg-white/6 px-3 py-2 text-sm font-semibold backdrop-blur-sm"
          aria-label="Reward Center"
        >
          <Gift size={14} />
          <span className="hidden sm:inline">Rewards</span>
        </button>
        
        <button
          onClick={() => {
            if (video?.productId) {
              router.push(`/product/${video.productId}`);
            } else {
              router.push("/");
            }
          }}
          className="flex items-center gap-2 rounded-full bg-white/6 px-3 py-2 text-sm font-semibold backdrop-blur-sm"
          aria-label="View Product"
        >
          <Package size={14} />
          <span className="hidden sm:inline">Product</span>
        </button>

        <button
          onClick={() => {
            if (video?.music) {
              router.push(`/mlm/watch-earn/audio/${encodeURIComponent(video.music)}`);
            }
          }}
          className={`flex items-center gap-2 rounded-full bg-white/6 px-3 py-2 text-sm font-semibold backdrop-blur-sm ${
            !video?.music ? "opacity-50 cursor-not-allowed" : ""
          }`}
          aria-label={video?.music ? "Use audio" : "No audio available"}
          disabled={!video?.music}
        >
          <Music size={14} />
          <span className="hidden sm:inline">Audio</span>
        </button>
      </div>
    </div>
  );
}
