"use client";

import { useEffect, useState } from "react";
import type { MonetagPlacementId } from "@/lib/ads/monetagPlacements";

type PublicMonetagSlot = {
  id: string;
  name: string;
  title: string;
  description: string;
  ctaLabel: string;
  url: string;
};

/** Renders only a slot enabled by Admin for this exact, allowlisted location. */
export function MonetagPlacement({ placement }: { placement: MonetagPlacementId }) {
  const [slot, setSlot] = useState<PublicMonetagSlot | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    fetch(`/api/ads/placements?placement=${encodeURIComponent(placement)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return await response.json() as { success?: boolean; slot?: PublicMonetagSlot | null };
      })
      .then((result) => {
        if (active && result?.success === true && result.slot?.url?.startsWith("https://")) {
          setSlot(result.slot);
        }
      })
      .catch(() => {
        // Ads fail closed. A provider/config issue never blocks page content.
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [placement]);

  if (!slot) return null;

  return (
    <aside
      aria-label="Advertisement"
      data-ad-placement={placement}
      className="my-5 rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-white shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">
          Sponsored
        </span>
        <span className="text-[10px] text-slate-500">Monetag</span>
      </div>
      <h2 className="mt-3 text-base font-bold">{slot.title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-300">{slot.description}</p>
      <a
        href={slot.url}
        target="_blank"
        rel="nofollow sponsored noopener noreferrer"
        className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
      >
        {slot.ctaLabel}
      </a>
    </aside>
  );
}
