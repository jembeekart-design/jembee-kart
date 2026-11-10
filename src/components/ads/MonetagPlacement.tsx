"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Megaphone } from "lucide-react";
import type { MonetagPlacementId } from "@/lib/ads/monetagPlacements";

type PublicMonetagSlot = {
  id: string;
  name: string;
  title: string;
  description: string;
  ctaLabel: string;
  advertiserName?: string;
  creativeImageUrl?: string | null;
  logoImageUrl?: string | null;
  url: string;
};

/** Renders only the admin-enabled Direct Link card for this exact allowlisted location. */
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

  if (!slot) {
    // Keep the Admin-defined location visible without inventing an advertiser,
    // creative, destination URL, or clickable fake ad.
    return (
      <aside
        aria-label="Advertisement space"
        data-ad-placement={placement}
        data-ad-slot-placeholder="true"
        role="note"
        className="my-5 flex min-h-20 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.025] px-4 py-5 text-center"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Sponsored space</p>
          <p className="mt-1 text-sm text-slate-500">यह विज्ञापन स्थान Admin द्वारा नियंत्रित है</p>
        </div>
      </aside>
    );
  }

  const advertiser = slot.advertiserName?.trim() || slot.name || "Sponsored offer";

  return (
    <aside
      aria-label="Advertisement"
      data-ad-placement={placement}
      className="my-6 overflow-hidden rounded-[22px] border border-white/10 bg-white text-slate-950 shadow-lg"
    >
      <a
        href={slot.url}
        target="_blank"
        rel="nofollow sponsored noopener noreferrer"
        aria-label={`${slot.title} — Sponsored offer`}
        className="group relative block aspect-[16/9] overflow-hidden bg-gradient-to-br from-cyan-950 via-slate-900 to-violet-950"
      >
        {slot.creativeImageUrl ? (
          <img src={slot.creativeImageUrl} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
        ) : (
          <div className="flex h-full items-center justify-center text-cyan-200">
            <Megaphone size={54} strokeWidth={1.4} />
          </div>
        )}
        <span className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-black/65 text-white backdrop-blur">
          <ExternalLink size={19} />
        </span>
      </a>

      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100 text-slate-500">
            {slot.logoImageUrl ? <img src={slot.logoImageUrl} alt="" loading="lazy" className="h-full w-full object-contain" /> : <Megaphone size={23} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-base font-bold leading-6 sm:text-lg">{slot.title}</p>
            <p className="mt-0.5 truncate text-sm text-slate-600">{advertiser}</p>
          </div>
        </div>
        {slot.description ? <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-600">{slot.description}</p> : null}
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
          <span className="font-bold text-slate-900">Sponsored</span>
          <span aria-hidden="true">·</span>
          <span>Monetag</span>
        </div>
        <a
          href={slot.url}
          target="_blank"
          rel="nofollow sponsored noopener noreferrer"
          className="mt-4 flex min-h-12 w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
        >
          {slot.ctaLabel}
        </a>
      </div>
    </aside>
  );
}
