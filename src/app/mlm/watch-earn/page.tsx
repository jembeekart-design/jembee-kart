"use client";

import dynamic from "next/dynamic";

const ProductionHeader = dynamic(() => import("./components/ProductionHeader"), { ssr: false });
const FullscreenVideoFeed = dynamic(() => import("./components/FullscreenVideoFeed"), { ssr: false });
const BottomQuickActions = dynamic(() => import("./components/BottomQuickActions"), { ssr: false });

export default function WatchEarnPage() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-black text-white">
      <ProductionHeader />
      <FullscreenVideoFeed />
      <BottomQuickActions />
    </main>
  );
}
