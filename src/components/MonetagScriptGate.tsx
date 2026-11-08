"use client";

import { useEffect } from "react";

export default function MonetagScriptGate() {
  useEffect(() => {
    let cancelled = false;
    let script: HTMLScriptElement | null = null;

    async function loadMonetag() {
      try {
        const response = await fetch("/api/monetag/global-status", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data: { enabled?: boolean } = await response.json();
        if (cancelled || data.enabled !== true) return;

        if (document.getElementById("monetag-zone-297992")) return;

        script = document.createElement("script");
        script.id = "monetag-zone-297992";
        script.src = "https://quge5.com/88/tag.min.js";
        script.async = true;
        script.dataset.zone = "297992";
        script.dataset.cfasync = "false";
        document.head.appendChild(script);
      } catch {
        // Fail closed: Monetag stays OFF when status cannot be checked.
      }
    }

    void loadMonetag();

    return () => {
      cancelled = true;
      script?.remove();
    };
  }, []);

  return null;
}
