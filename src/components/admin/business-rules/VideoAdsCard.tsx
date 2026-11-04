"use client";

import { useEffect, useState } from "react";
import { businessRules } from "@/firestore/businessRules";
import type { VideoAdsRules } from "@/firestore/businessRules";

export default function VideoAdsCard() {
  const [rules, setRules] = useState<VideoAdsRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    businessRules.getVideoAdsRules()
      .then(setRules)
      .catch((err) => {
        console.error(err);
        setError("Video Ads settings load nahi ho sakin.");
      })
      .finally(() => setLoading(false));
  }, []);

  async function toggleAds() {
    if (!rules || saving) return;

    const updated = { ...rules, enabled: !rules.enabled };
    setSaving(true);
    setError("");

    try {
      await businessRules.saveVideoAdsRules(updated);
      setRules(updated);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Settings save nahi hui.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-background)] p-6">
        Loading Video Ads settings...
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-background)] p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Global Video Ads
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Ek setting se sabhi Paid aur Free videos ke ads control karein.
          </p>
        </div>

        <button
          type="button"
          onClick={toggleAds}
          disabled={!rules || saving}
          className="rounded-lg bg-[var(--color-primary-button)] px-5 py-3 font-medium text-[var(--button-text-color)] disabled:opacity-50"
        >
          {saving ? "Saving..." : rules?.enabled ? "Disable All Video Ads" : "Enable All Video Ads"}
        </button>
      </div>

      {rules && (
        <div className="mt-5 grid gap-3 text-sm text-[var(--text-primary)]">
          <p>Global status: <strong>{rules.enabled ? "ON" : "OFF"}</strong></p>
          <p>First ad: 5 minutes</p>
          <p>Second ad: 10 minutes</p>
          <p>Third ad: 20 minutes</p>
          <p>Fourth ad: 35 minutes</p>
          <p>After fourth: every 15 minutes</p>
          <p>JembeeKart ad auto-dismiss: 8 seconds</p>
          <p className="text-[var(--text-muted)]">
            Paid aur Free dono videos par ads lagu honge.
          </p>
        </div>
      )}

      {error && <p role="alert" className="mt-4 text-sm text-red-500">{error}</p>}
    </section>
  );
}
