"use client";

import { Suspense, useState } from "react";
import ProductionHeader from "../videos/components/ProductionHeader";
import FullscreenVideoFeed from "../videos/components/FullscreenVideoFeed";

export default function JembeeShortsPage() {
  const [activeTab, setActiveTab] = useState<"foryou" | "following">("foryou");

  return (
    <main
      className="relative h-[100dvh] min-h-[100svh] w-full overflow-hidden bg-black text-white"
      aria-label="JEMBEE PLAY video feed"
    >
      <ProductionHeader />
      <nav
        aria-label="Shorts feed"
        className="pointer-events-none absolute left-0 right-0 top-16 z-40 flex justify-center gap-2 px-4"
      >
        <div className="pointer-events-auto inline-flex rounded-full border border-white/15 bg-black/55 p-1 shadow-lg backdrop-blur-xl">
          <button
            type="button"
            aria-pressed={activeTab === "foryou"}
            onClick={() => setActiveTab("foryou")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${activeTab === "foryou" ? "bg-white text-black" : "text-white/80 hover:bg-white/10"}`}
          >
            For You
          </button>
          <button
            type="button"
            aria-pressed={activeTab === "following"}
            onClick={() => setActiveTab("following")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${activeTab === "following" ? "bg-white text-black" : "text-white/80 hover:bg-white/10"}`}
          >
            Following
          </button>
        </div>
      </nav>
      <Suspense fallback={<div className="h-full w-full bg-black" aria-label="Loading video feed" />}>
        <FullscreenVideoFeed activeTab={activeTab} />
      </Suspense>
    </main>
  );
}
