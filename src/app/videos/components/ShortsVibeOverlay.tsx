"use client";

import React from "react";
import { Heart } from "lucide-react";

export default function ShortsVibeOverlay() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[13rem] z-20">
      {/* LEFT — GOOD VIBES ONLY */}
      <div className="absolute left-5 top-6">
        <div
          className="text-[35px] leading-[0.92] text-cyan-900/90"
          style={{
            fontFamily:
              '"Brush Script MT", "Segoe Script", cursive',
            fontWeight: 700,
            transform: "rotate(-5deg)",
          }}
        >
          <div>Good</div>
          <div>Vibes</div>
          <div>Only</div>
        </div>

        {/* HAND DRAWN UNDERLINE */}
        <div
          className="ml-1 mt-2 h-[5px] w-[96px] rounded-full bg-cyan-400"
          style={{
            transform: "rotate(-8deg)",
            boxShadow: "0 0 8px rgba(34,211,238,.35)",
          }}
        />

        {/* SMALL SMILE */}
        <span
          className="absolute -right-4 bottom-10 text-[22px] font-bold text-cyan-700/80"
          style={{
            transform: "rotate(8deg)",
          }}
        >
          ˘͈ᵕ˘͈
        </span>
      </div>

      {/* RIGHT — WATCH / CREATE / EARN / TOGETHER */}
      <div className="absolute right-5 top-10">
        <div
          className="text-[25px] font-medium leading-[1.38] text-slate-700/75"
          style={{
            transform: "rotate(-4deg)",
          }}
        >
          <div>Watch</div>
          <div>Create</div>
          <div>Earn</div>
          <div>Together</div>
        </div>

        <div className="mt-1 flex justify-center">
          <Heart
            size={31}
            strokeWidth={2.2}
            className="text-cyan-400"
          />
        </div>
      </div>
    </div>
  );
}
