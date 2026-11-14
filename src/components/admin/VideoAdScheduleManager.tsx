"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/client/adminFetch";
import {
  DEFAULT_VIDEO_ADS_RULES,
  type VideoAdsRules,
  type LongVideoAdAudienceRules,
} from "@/lib/ads/videoAdsRules";

const AUDIENCES = [
  { key: "free", label: "Free Long Videos" },
  { key: "paid", label: "Paid Long Videos" },
] as const;

type AudienceKey = (typeof AUDIENCES)[number]["key"];

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-semibold text-slate-200">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-white outline-none focus:border-cyan-400"
        />
        {suffix && <span className="text-xs text-slate-400">{suffix}</span>}
      </div>
    </label>
  );
}

export function VideoAdScheduleManager() {
  const [rules, setRules] = useState<VideoAdsRules>(DEFAULT_VIDEO_ADS_RULES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminFetch("/api/admin/video-ads");
      const result = await response.json();
      if (!response.ok || result.success !== true || !result.rules) {
        throw new Error(result.message || "Video Ads settings लोड नहीं हुईं।");
      }
      setRules(result.rules as VideoAdsRules);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Settings लोड नहीं हुईं।");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function updateAudience(
    audience: AudienceKey,
    patch: Partial<LongVideoAdAudienceRules>,
  ) {
    setRules((current) => ({
      ...current,
      longVideoAds: {
        ...current.longVideoAds,
        [audience]: {
          ...current.longVideoAds[audience],
          ...patch,
        },
      },
    }));
  }

  async function save() {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await adminFetch("/api/admin/video-ads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rules),
      });
      const result = await response.json();

      if (!response.ok || result.success !== true || !result.rules) {
        throw new Error(result.message || "Settings save नहीं हुईं।");
      }

      setRules(result.rules as VideoAdsRules);
      setMessage("Video Ads schedule सफलतापूर्वक save हो गया।");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Settings save नहीं हुईं।");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-white/10 bg-[#111a28] p-5 text-sm text-slate-300">
        Video Ads settings लोड हो रही हैं…
      </section>
    );
  }

  return (
    <section className="space-y-5 rounded-2xl border border-cyan-400/20 bg-[#111a28] p-5 text-white sm:p-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">
          JEMBEE PLAY • Long Video Monetization
        </p>
        <h2 className="mt-1 text-xl font-black">Long Video Ad Schedule</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Free और Paid Long Videos के लिए अलग-अलग automatic ad schedules नियंत्रित करें।
          समय actual video playback के अनुसार लागू होना चाहिए।
        </p>
      </div>

      <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
        <span>
          <span className="block font-bold">Long Video Ads Master Switch</span>
          <span className="mt-1 block text-xs text-slate-400">
            इसे बंद करने पर दोनों audiences के long-video ads disabled रहेंगे।
          </span>
        </span>
        <input
          type="checkbox"
          checked={rules.longVideoAds.enabled}
          onChange={(event) =>
            setRules((current) => ({
              ...current,
              longVideoAds: {
                ...current.longVideoAds,
                enabled: event.target.checked,
              },
            }))
          }
          className="h-5 w-5 accent-cyan-400"
        />
      </label>

      {AUDIENCES.map(({ key, label }) => {
        const audience = rules.longVideoAds[key];

        return (
          <div
            key={key}
            className="space-y-4 rounded-2xl border border-white/10 bg-black/15 p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-bold">{label}</h3>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={audience.enabled}
                  onChange={(event) =>
                    updateAudience(key, { enabled: event.target.checked })
                  }
                  className="h-4 w-4 accent-cyan-400"
                />
                Enable ads
              </label>
            </div>

            <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 p-3">
              <span>
                <span className="block text-sm font-semibold">Pre-roll Ad</span>
                <span className="block text-xs text-slate-400">
                  Content शुरू होने से पहले ad
                </span>
              </span>
              <input
                type="checkbox"
                checked={audience.preRollEnabled}
                onChange={(event) =>
                  updateAudience(key, { preRollEnabled: event.target.checked })
                }
                className="h-4 w-4 accent-cyan-400"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                label="First Mid-roll"
                value={audience.firstMidrollSeconds}
                min={30}
                max={86400}
                suffix="seconds"
                onChange={(value) =>
                  updateAudience(key, { firstMidrollSeconds: value })
                }
              />
              <NumberField
                label="Repeat Interval"
                value={audience.repeatIntervalSeconds}
                min={30}
                max={86400}
                suffix="seconds"
                onChange={(value) =>
                  updateAudience(key, { repeatIntervalSeconds: value })
                }
              />
              <NumberField
                label="Maximum Ads Per Video"
                value={audience.maxAdsPerVideo}
                min={1}
                max={50}
                onChange={(value) =>
                  updateAudience(key, { maxAdsPerVideo: value })
                }
              />
              <NumberField
                label="Minimum Gap Between Ads"
                value={audience.minGapSeconds}
                min={30}
                max={86400}
                suffix="seconds"
                onChange={(value) =>
                  updateAudience(key, { minGapSeconds: value })
                }
              />
            </div>

            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-200">
                Custom Ad Breaks (seconds)
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="उदाहरण: 120, 300, 600"
                value={audience.customBreaksSeconds.join(", ")}
                onChange={(event) => {
                  const values = event.target.value
                    .split(",")
                    .map((part) => part.trim())
                    .filter(Boolean)
                    .map(Number);
                  updateAudience(key, {
                    customBreaksSeconds: values,
                  });
                }}
                className="w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-white outline-none focus:border-cyan-400"
              />
              <span className="block text-xs text-slate-500">
                30 से 86400 seconds तक, comma-separated; अधिकतम 50 breaks।
              </span>
            </label>
          </div>
        );
      })}

      <div className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm leading-6 text-amber-100">
        इन settings को save करने से ExoClick अपने-आप चालू नहीं होगा।
        Provider enable करने से पहले player integration, ad fallback और playback QA जरूरी है।
        Paid video purchase और payment verification अलग सुरक्षित flow में ही रहेंगे।
      </div>

      {message && (
        <p role="status" className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Video Ad Settings"}
        </button>
        <button
          type="button"
          onClick={() => void load()}
          disabled={saving}
          className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5 disabled:opacity-50"
        >
          Reload
        </button>
      </div>
    </section>
  );
}
