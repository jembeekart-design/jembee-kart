"use client";

import { Suspense, useState } from "react";
import ProductionHeader from "../videos/components/ProductionHeader";
import FullscreenVideoFeed from "../videos/components/FullscreenVideoFeed";

export default function JembeeShortsPage() {
  const [activeTab] = useState<"foryou" | "following">("foryou");

  return (
    <main
      className="relative h-[100dvh] min-h-[100svh] w-full overflow-hidden bg-black text-white"
      aria-label="JEMBEE PLAY video feed"
    >
      <ProductionHeader />
      <Suspense fallback={<div className="h-full w-full bg-black" aria-label="Loading video feed" />}>
        <FullscreenVideoFeed activeTab={activeTab} />
      </Suspense>
    </main>
  );
}
