"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  runTransaction,
  where,
} from "firebase/firestore";
import { Megaphone, ExternalLink } from "lucide-react";
import { db } from "@/firebase/config";

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

        // Impression billing
        await recordImpression(adDoc.id);
      } catch (error) {
        console.error("AdSlot error:", error);
        setAd(null);
      }
    }

    async function recordImpression(adId: string) {
      try {
        await runTransaction(db, async (transaction) => {
          const adRef = doc(db, "ads", adId);
          const snap = await transaction.get(adRef);

          if (!snap.exists()) return;

          const data = snap.data();

          if (data.status !== "Running") return;

          const pricingModel =
            data.pricingModel === "CPM" ? "CPM" : "CPC";

          const remainingBudget = Number(
            data.remainingBudget ?? data.budget ?? 0
          );

          if (remainingBudget <= 0) {
            transaction.update(adRef, {
              status: "Completed",
              remainingBudget: 0,
            });
            return;
          }

          const impressions =
            Number(data.impressions ?? 0) + 1;

          let charge = 0;

          // CPM = rate per 1,000 impressions
          if (pricingModel === "CPM") {
            charge = Number(data.rate ?? 0) / 1000;
            charge = Math.min(charge, remainingBudget);
          }

          const newRemainingBudget =
            Math.max(0, remainingBudget - charge);

          const newRevenue =
            Number(data.revenue ?? 0) + charge;

          transaction.update(adRef, {
            impressions,
            revenue: newRevenue,
            remainingBudget: newRemainingBudget,
            updatedAt: new Date(),
            ...(newRemainingBudget <= 0
              ? { status: "Completed" }
              : {}),
          });
        });
      } catch (error) {
        console.error("Ad impression billing failed:", error);
      }
    }

    loadAd();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleView() {
    if (!ad) return;

    try {
      await runTransaction(db, async (transaction) => {
        const adRef = doc(db, "ads", ad.id);
        const snap = await transaction.get(adRef);

        if (!snap.exists()) return;

        const data = snap.data();

        if (data.status !== "Running") return;

        const pricingModel =
          data.pricingModel === "CPM" ? "CPM" : "CPC";

        const remainingBudget = Number(
          data.remainingBudget ?? data.budget ?? 0
        );

        if (remainingBudget <= 0) {
          transaction.update(adRef, {
            status: "Completed",
            remainingBudget: 0,
          });
          return;
        }

        const clicks = Number(data.clicks ?? 0) + 1;

        let charge = 0;

        // CPC = rate per click
        if (pricingModel === "CPC") {
          charge = Number(data.rate ?? 0);
          charge = Math.min(charge, remainingBudget);
        }

        const newRemainingBudget =
          Math.max(0, remainingBudget - charge);

        const newRevenue =
          Number(data.revenue ?? 0) + charge;

        transaction.update(adRef, {
          clicks,
          revenue: newRevenue,
          remainingBudget: newRemainingBudget,
          updatedAt: new Date(),
          ...(newRemainingBudget <= 0
            ? { status: "Completed" }
            : {}),
        });
      });

      // Destination URL open karo
      if (ad.url) {
        window.open(
          ad.url,
          "_blank",
          "noopener,noreferrer"
        );
      }

      setAd((current) =>
        current
          ? {
              ...current,
              clicks: current.clicks + 1,
              revenue:
                current.pricingModel === "CPC"
                  ? current.revenue +
                    Math.min(current.rate, current.remainingBudget)
                  : current.revenue,
              remainingBudget:
                current.pricingModel === "CPC"
                  ? Math.max(
                      0,
                      current.remainingBudget -
                        Math.min(
                          current.rate,
                          current.remainingBudget
                        )
                    )
                  : current.remainingBudget,
            }
          : current
      );
    } catch (error) {
      console.error("Ad click billing failed:", error);
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
