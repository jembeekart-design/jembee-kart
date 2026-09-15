"use client";

import React from "react";
import { UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { WatchVideo } from "../services/watchVideos.service";

export default function BottomQuickActions({
  video,
}: {
  video?: WatchVideo;
}) {
  const router = useRouter();

  return (
    <div className="pointer-events-auto fixed bottom-4 left-0 right-0 z-50 flex justify-center">
      <button
        type="button"
        onClick={() => router.push("/mlm/watch-earn/upload")}
        aria-label="Upload video"
        className="flex items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-base font-semibold text-black shadow-lg backdrop-blur-sm"
      >
        <UploadCloud size={22} />
        <span>Upload</span>
      </button>
    </div>
  );
}
