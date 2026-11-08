"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const ProductionHeader = dynamic(
  () => import("../videos/components/ProductionHeader"),
  { ssr: false }
);
const FullscreenVideoFeed = dynamic(
  () => import("../videos/components/FullscreenVideoFeed"),
  { ssr: false }
);

export default function JembeeShortsPage() {
  const [activeTab] = useState<"foryou" | "following">("foryou");

  return (
    <main
      className="relative h-[100dvh] w-full overflow-hidden bg-black text-white"
      aria-label="JEMBEE PLAY video feed"
    >
      <ProductionHeader />
      <FullscreenVideoFeed activeTab={activeTab} />
    </main>
  );
}
