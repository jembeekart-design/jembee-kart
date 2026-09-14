"use client";

import React from "react";
import {
  Home,
  Compass,
  Plus,
  WalletCards,
  User,
} from "lucide-react";
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

  const go = (path: string) => {
    requireAuth(() => router.push(path));
  };

  return (
    <nav
      className="
        pointer-events-none
        fixed
        inset-x-0
        bottom-0
        z-50
        px-2
        pb-[calc(0.65rem+env(safe-area-inset-bottom))]
      "
    >
      <div
        className="
          pointer-events-auto
          relative
          mx-auto
          flex
          h-[78px]
          w-full
          max-w-[680px]
          items-end
          justify-between
          rounded-[28px]
          border
          border-white/15
          bg-black/50
          px-3
          pb-3
          backdrop-blur-xl
          shadow-[0_-2px_24px_rgba(0,0,0,0.35)]
        "
      >
        {/* HOME */}
        <button
          type="button"
          onClick={() => go("/mlm/watch-earn")}
          className="
            flex
            w-[18%]
            flex-col
            items-center
            gap-1
            text-white
          "
        >
          <Home
            size={27}
            strokeWidth={2.3}
            className="
              fill-cyan-300
              text-cyan-300
              drop-shadow-[0_0_9px_rgba(34,211,238,0.8)]
            "
          />

          <span className="text-[13px] font-semibold">
            Home
          </span>
        </button>

        {/* EXPLORE */}
        <button
          type="button"
          onClick={() => go("/mlm/watch-earn")}
          className="
            flex
            w-[18%]
            flex-col
            items-center
            gap-1
            text-white/90
          "
        >
          <Compass
            size={27}
            strokeWidth={2.1}
          />

          <span className="text-[13px] font-semibold">
            Explore
          </span>
        </button>

        {/* UPLOAD */}
        <button
          type="button"
          aria-label="Upload video"
          onClick={() =>
            requireAuth(() =>
              router.push("/mlm/watch-earn/upload")
            )
          }
          className="
            relative
            -mt-[38px]
            flex
            w-[20%]
            flex-col
            items-center
            gap-1
            text-white
          "
        >
          <span
            className="
              flex
              h-[62px]
              w-[62px]
              items-center
              justify-center
              rounded-full
              border-[3px]
              border-cyan-300
              bg-gradient-to-br
              from-cyan-300
              via-cyan-400
              to-teal-400
              text-black
              shadow-[0_0_30px_rgba(34,211,238,0.8)]
            "
          >
            <Plus
              size={38}
              strokeWidth={1.7}
            />
          </span>

          <span className="text-[13px] font-bold">
            Upload
          </span>
        </button>

        {/* EARN */}
        <button
          type="button"
          onClick={() => go("/mlm")}
          className="
            relative
            flex
            w-[18%]
            flex-col
            items-center
            gap-1
            text-white/90
          "
        >
          <WalletCards
            size={27}
            strokeWidth={2.1}
          />

          <span
            className="
              absolute
              right-[22%]
              top-[-2px]
              h-[10px]
              w-[10px]
              rounded-full
              bg-pink-500
              shadow-[0_0_8px_rgba(236,72,153,0.9)]
            "
          />

          <span className="text-[13px] font-semibold">
            Earn
          </span>
        </button>

        {/* PROFILE */}
        <button
          type="button"
          onClick={() => go("/profile")}
          className="
            flex
            w-[18%]
            flex-col
            items-center
            gap-1
            text-white/90
          "
        >
          <User
            size={27}
            strokeWidth={2.1}
          />

          <span className="text-[13px] font-semibold">
            Profile
          </span>
        </button>
      </div>
    </nav>
  );
}
