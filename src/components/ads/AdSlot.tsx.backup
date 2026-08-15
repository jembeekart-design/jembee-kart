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

        // Every ad view = one impression.
        await recordImpression(adDoc.id);
      } catch (error) {
        console.error("AdSlot error:", error);
        setAd(null);
      }
    }

    loadAd();

    return () => {
      cancelled = true;
    };
  }, []);

  async function recordImpression(adId: string) {
    try {
      await runTransaction(db, async (transaction) => {
        const ref = doc(db, "ads", adId);
        const snap = await transaction.get(ref);

        if (!snap.exists()) return;

        const data = snap.data();

        if (data.status !== "Running") return;

        const pricingModel =
          data.pricingModel === "CPM" ? "CPM" : "CPC";

        const rate = Number(data.rate ?? 0);
        const currentRemaining = Number(
          data.remainingBudget ?? data.budget ?? 0
        );

        if (currentRemaining <= 0) {
          transaction.update(ref, {
            status: "Completed",
            remainingBudget: 0,
          });
          return;
        }

        let charge = 0;

        if (pricingModel === "CPM") {
          // CPM = cost per 1,000 impressions.
          charge = rate / 1000;

          if (charge > currentRemaining) {
            charge = currentRemaining;
          }
        }

        const newRemaining = Math.max(
          0,
          currentRemaining - charge
        );

        transaction.update(ref, {
          impressions: Number(data.impressions ?? 0) + 1,
          revenue: Number(data.revenue ?? 0) + charge,
          remainingBudget: newRemaining,
          ...(newRemaining <= 0
            ? { status: "Completed" }
            : {}),
        });
      });

      setAd((current) => {
        if (!current) return current;

        const charge =
          current.pricingModel === "CPM"
            ? Math.min(
                current.rate / 1000,
                current.remainingBudget
              )
            : 0;

        const remainingBudget = Math.max(
          0,
          current.remainingBudget - charge
        );

        return {
          ...current,
          impressions: current.impressions + 1,
          revenue: current.revenue + charge,
          remainingBudget,
          status:
            remainingBudget <= 0
              ? "Completed"
              : current.status,
        };
      });
    } catch (error) {
      console.error("Ad impression billing failed:", error);
    }
  }

  async function handleView() {
    if (!ad) return;

    try {
      const result = await runTransaction(db, async (transaction) => {
        const ref = doc(db, "ads", ad.id);
        const snap = await transaction.get(ref);

        if (!snap.exists()) {
          return { allowed: false };
        }

        const data = snap.data();

        if (data.status !== "Running") {
          return { allowed: false };
        }

        const pricingModel =
          data.pricingModel === "CPM" ? "CPM" : "CPC";

        const rate = Number(data.rate ?? 0);
        const currentRemaining = Number(
          data.remainingBudget ?? data.budget ?? 0
        );

        // CPC charges on every valid click.
        if (pricingModel === "CPC") {
          if (rate <= 0 || currentRemaining < rate) {
            transaction.update(ref, {
              status: "Completed",
              remainingBudget: Math.max(0, currentRemaining),
            });

            return { allowed: false };
          }

          const newRemaining = currentRemaining - rate;

          transaction.update(ref, {
            clicks: Number(data.clicks ?? 0) + 1,
            revenue: Number(data.revenue ?? 0) + rate,
            remainingBudget: newRemaining,
            ...(newRemaining <= 0
              ? { status: "Completed" }
              : {}),
          });

          return {
            allowed: true,
            charge: rate,
            remainingBudget: newRemaining,
            clicks: Number(data.clicks ?? 0) + 1,
          };
        }

        // CPM does not charge on click.
        transaction.update(ref, {
          clicks: Number(data.clicks ?? 0) + 1,
        });

        return {
          allowed: true,
          charge: 0,
          remainingBudget: currentRemaining,
          clicks: Number(data.clicks ?? 0) + 1,
        };
      });

      if (!result.allowed) {
        setAd((current) =>
          current
            ? { ...current, status: "Completed" }
            : current
        );
        return;
      }

      setAd((current) =>
        current
          ? {
              ...current,
              clicks: result.clicks ?? current.clicks + 1,
              revenue:
                current.revenue + Number(result.charge ?? 0),
              remainingBudget:
                result.remainingBudget ??
                current.remainingBudget,
              status:
                Number(result.remainingBudget ?? 0) <= 0
                  ? "Completed"
                  : current.status,
            }
          : current
      );

      // Advertiser destination open karo.
      if (ad.url) {
        window.open(ad.url, "_blank", "noopener,noreferrer");
      }
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
