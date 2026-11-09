"use client";

import { useState } from "react";
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
      <FullscreenVideoFeed activeTab={activeTab} />
    </main>
  );
}
