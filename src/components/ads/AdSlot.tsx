"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  increment,
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

        /*
         * IMPRESSION BILLING
         *
         * CPM:
         * rate = cost per 1,000 impressions
         *
         * CPC:
         * impression count only; no money deducted.
         */
        try {
          await runTransaction(db, async (transaction) => {
            const ref = doc(db, "ads", adDoc.id);
            const fresh = await transaction.get(ref);

            if (!fresh.exists()) return;

            const current = fresh.data();

            const status = String(current.status ?? "Running");

            if (status !== "Running") return;

            const currentBudget = Number(
              current.remainingBudget ??
                current.budget ??
                0
            );

            const currentImpressions = Number(
              current.impressions ?? 0
            );

            const pricingModel =
              current.pricingModel === "CPM"
                ? "CPM"
                : "CPC";

            const rate = Number(current.rate ?? 0);

            const nextImpressions =
              currentImpressions + 1;

            let charge = 0;

            if (pricingModel === "CPM") {
              charge = rate / 1000;
            }

            const nextBudget = Math.max(
              0,
              currentBudget - charge
            );

            transaction.update(ref, {
              impressions: increment(1),
              remainingBudget: nextBudget,
              status:
                nextBudget <= 0
                  ? "Completed"
                  : "Running",
            });
          });
        } catch (billingError) {
          console.error(
            "Ad impression billing failed:",
            billingError
          );
        }
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

  async function handleView() {
    if (!ad) return;

    /*
     * CPC BILLING
     *
     * Click hone par:
     * remainingBudget se CPC rate minus hoga.
     */
    try {
      let shouldOpen = true;

      await runTransaction(db, async (transaction) => {
        const ref = doc(db, "ads", ad.id);
        const fresh = await transaction.get(ref);

        if (!fresh.exists()) {
          shouldOpen = false;
          return;
        }

        const current = fresh.data();

        if (String(current.status) !== "Running") {
          shouldOpen = false;
          return;
        }

        const pricingModel =
          current.pricingModel === "CPM"
            ? "CPM"
            : "CPC";

        const rate = Number(current.rate ?? 0);

        const currentBudget = Number(
          current.remainingBudget ??
            current.budget ??
            0
        );

        /*
         * CPC:
         * one click = one rate charge
         *
         * CPM:
         * click does NOT charge.
         */
        const charge =
          pricingModel === "CPC"
            ? rate
            : 0;

        if (
          pricingModel === "CPC" &&
          currentBudget < charge
        ) {
          shouldOpen = false;

          transaction.update(ref, {
            status: "Completed",
            remainingBudget: 0,
          });

          return;
        }

        const nextBudget = Math.max(
          0,
          currentBudget - charge
        );

        transaction.update(ref, {
          clicks: increment(1),
          remainingBudget: nextBudget,
          status:
            nextBudget <= 0
              ? "Completed"
              : "Running",
        });

        setAd((currentAd) =>
          currentAd
            ? {
                ...currentAd,
                clicks: currentAd.clicks + 1,
                remainingBudget: nextBudget,
                status:
                  nextBudget <= 0
                    ? "Completed"
                    : "Running",
              }
            : currentAd
        );
      });

      if (shouldOpen && ad.url) {
        window.open(
          ad.url,
          "_blank",
          "noopener,noreferrer"
        );
      }
    } catch (error) {
      console.error(
        "Ad click billing failed:",
        error
      );
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
