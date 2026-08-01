"use client";

import React from "react";
import VerticalVideoFeed from "./VerticalVideoFeed";

export default function FullscreenVideoFeed() {
  return (
    <section className="absolute inset-0 h-full w-full bg-black">
      {/* enforce full-bleed safe area for vertical videos */}
      <div className="h-full w-full">
        <VerticalVideoFeed />
      </div>
    </section>
  );
}
