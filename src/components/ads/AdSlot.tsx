"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import { Megaphone, ExternalLink } from "lucide-react";
import { db, auth } from "@/firebase/config";

interface Ad {
  id: string;
  title: string;
  url?: string;
  platform: string;
  budget: number;
  status: string;
  impressions: number;
  clicks: number;
  revenue: number;
  pricingModel: "CPC" | "CPM";
  rate: number;
  remainingBudget: number;
}

type AdEventType = "impression" | "click";

export default function AdSlot() {
  const [ad, setAd] = useState<Ad | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAd() {
      try {
        const q = query(
          collection(db, "ads"),
          where("status", "==", "Running"),
          limit(1)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty || cancelled) {
          setAd(null);
          return;
        }

        const adDoc = snapshot.docs[0];
        const data = adDoc.data();

        const currentAd: Ad = {
          id: adDoc.id,
          title: String(data.title ?? "Sponsored Ad"),
          url: String(data.url ?? ""),
          platform: String(data.platform ?? "JembeeKart Ads"),
          budget: Number(data.budget ?? 0),
          status: String(data.status ?? "Running"),
          impressions: Number(data.impressions ?? 0),
          clicks: Number(data.clicks ?? 0),
          revenue: Number(data.revenue ?? 0),
          pricingModel:
            data.pricingModel === "CPM" ? "CPM" : "CPC",
          rate: Number(data.rate ?? 0),
          remainingBudget: Number(
            data.remainingBudget ?? data.budget ?? 0
          ),
        };

        setAd(currentAd);

        if (!cancelled) {
          await sendAdEvent(adDoc.id, "impression");
        }
      } catch (error) {
        console.error("AdSlot error:", error);
        if (!cancelled) {
          setAd(null);
        }
      }
    }

    loadAd();

    return () => {
      cancelled = true;
    };
  }, []);

  async function sendAdEvent(
    adId: string,
    eventType: AdEventType
  ) {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.warn(
          "Ad event skipped: user is not authenticated."
        );
        return null;
      }

      const token = await currentUser.getIdToken();

      const eventId =
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${adId}-${eventType}-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2)}`;

      const response = await fetch("/api/ads/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adId,
          eventType,
          eventId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error(
          "Ad event API failed:",
          result?.message || "Unknown error"
        );
        return null;
      }

      return result;
    } catch (error) {
      console.error("Ad event request failed:", error);
      return null;
    }
  }

  async function handleView() {
    if (!ad) return;

    const result = await sendAdEvent(ad.id, "click");

    if (!result) {
      return;
    }

    if (!result.allowed) {
      setAd((current) =>
        current
          ? {
              ...current,
              status:
                result.reason === "Ad is not running" ||
                result.reason === "Budget exhausted" ||
                result.reason === "Insufficient budget"
                  ? "Completed"
                  : current.status,
            }
          : current
      );
      return;
    }

    setAd((current) => {
      if (!current) return current;

      const charge = Number(result.charge ?? 0);
      const remainingBudget =
        Number(
          result.remainingBudget ?? current.remainingBudget
        );

      return {
        ...current,
        clicks: current.clicks + 1,
        revenue: current.revenue + charge,
        remainingBudget,
        status:
          remainingBudget <= 0
            ? "Completed"
            : current.status,
      };
    });

    if (ad.url) {
      window.open(ad.url, "_blank", "noopener,noreferrer");
    }
  }

  if (!ad) return null;

  return (
    <section className="relative z-30 w-full px-3 py-4 md:px-6">
      <div className="relative z-30 mx-auto min-h-[120px] max-w-7xl overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--card-color)] shadow-sm">
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-secondary-button)] text-[var(--text-primary)]">
              <Megaphone size={22} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase opacity-60">
                Sponsored • {ad.platform}
              </p>

              <h2 className="mt-1 truncate text-xl font-black text-[var(--text-primary)]">
                {ad.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleView}
            className="flex shrink-0 items-center gap-2 rounded-2xl bg-[var(--color-secondary-button)] px-4 py-2 font-bold text-[var(--text-primary)]"
          >
            View
            <ExternalLink size={16} />
          </button>
        </div>

        <div className="border-t border-[var(--color-border)] px-5 py-3 text-xs text-[var(--text-muted)]">
          Advertisement
        </div>
      </div>
    </section>
  );
}
