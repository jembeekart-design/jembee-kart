"use client";

import React from "react";
import { UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { WatchVideo } from "../services/watchVideos.service";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function BottomQuickActions({
  video,
}: {
  video?: WatchVideo;
}) {
  const router = useRouter();
  const { requireAuth } = useRequireAuth();

  return (
    <div
      className="
        pointer-events-none
        fixed
        inset-x-0
        bottom-[calc(1rem+env(safe-area-inset-bottom))]
        z-50
        flex
        justify-center
        px-5
      "
    >
      <button
        type="button"
        onClick={() =>
          requireAuth(() =>
            router.push("/mlm/watch-earn/upload")
          )
        }
        aria-label="Upload video"
        className="
          pointer-events-auto
          flex
          min-w-[190px]
          items-center
          justify-center
          gap-3
          rounded-full
          border
          border-cyan-300/40
          bg-black/45
          px-8
          py-4
          text-[16px]
          font-black
          text-white
          shadow-[0_0_28px_rgba(34,211,238,0.28)]
          backdrop-blur-2xl
          transition-all
          active:scale-95
          active:bg-cyan-400/20
        "
      >
        <span
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            bg-cyan-400
            text-black
            shadow-[0_0_18px_rgba(34,211,238,0.6)]
          "
        >
          <UploadCloud size={21} strokeWidth={2.5} />
        </span>

        <span>Upload</span>
      </button>
    </div>
  );
}
