"use client";

import React from "react";
import VideoInfo from "./VideoInfo";

export default function CreatorPanel() {
  return (
    <div className="pointer-events-auto fixed left-4 bottom-24 z-40 max-w-[65%]">
      <div className="space-y-2">
        <VideoInfo username={""} caption={""} hashtags={[]} music={""} verified={false} />
      </div>
    </div>
  );
}
