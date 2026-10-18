"use client";

import React, { useEffect } from "react";
import VerticalVideoFeed from "./VerticalVideoFeed";

export default function FullscreenVideoFeed({ activeTab }: { activeTab: 'foryou' | 'following' }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://quge5.com/88/tag.min.js";
    script.async = true;
    script.dataset.zone = "297942";
    script.dataset.cfasync = "false";
    script.dataset.jembeekartMonetag = "shorts";

    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return (
    <section className="absolute inset-0 h-full w-full bg-black">
      <div className="h-full w-full">
        <VerticalVideoFeed activeTab={activeTab} />
      </div>
    </section>
  );
}
