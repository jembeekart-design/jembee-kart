"use client";

import { useEffect, useState } from "react";
import { auth } from "@/firebase/config";
import type { VideoAdsRules } from "@/firestore/businessRules/types";

const defaults: VideoAdsRules = { enabled: false, firstAdAfterVideos: 5, repeatEveryVideos: 3, autoDismissSeconds: 8 };

export default function VideoAdsCard() {
  const [rules, setRules] = useState<VideoAdsRules>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function request(method: "GET" | "PUT", body?: VideoAdsRules) {
    const user = auth.currentUser;
    if (!user) throw new Error("पहले Admin अकाउंट से लॉगिन करें।");
    const token = await user.getIdToken();
    const response = await fetch("/api/admin/video-ads", {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || "Request failed");
    return data.rules as VideoAdsRules;
  }

  useEffect(() => {
    let active = true;
    request("GET").then((value) => { if (active) setRules(value); })
      .catch((error) => { if (active) setMessage(error instanceof Error ? error.message : "लोड नहीं हुआ"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function save() {
    setSaving(true); setMessage("");
    try { setRules(await request("PUT", rules)); setMessage("Video Ads settings सेव हो गईं।"); }
    catch (error) { setMessage(error instanceof Error ? error.message : "सेव नहीं हुआ"); }
    finally { setSaving(false); }
  }

  return <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-background)] p-6 space-y-4">
    <div><h2 className="text-xl font-bold">Video Ads Control</h2><p className="text-sm text-[var(--text-muted)]">Free और paid video feed के JembeeKart Floating Ads नियंत्रित करें।</p></div>
    {loading ? <p>Loading...</p> : <>
      <label className="flex items-center justify-between gap-4"><span className="font-medium">Global Video Ads</span><input type="checkbox" checked={rules.enabled} onChange={e => setRules(v => ({ ...v, enabled: e.target.checked }))} /></label>
      <label className="block text-sm">पहले कितने वीडियो बिना विज्ञापन रहें?
        <input className="mt-1 block w-full rounded-lg border p-2 bg-transparent" type="number" min={5} max={1000} value={rules.firstAdAfterVideos} onChange={e => setRules(v => ({ ...v, firstAdAfterVideos: Number(e.target.value) }))} />
      </label>
      <label className="block text-sm">उसके बाद हर कितने वीडियो पर विज्ञापन आए?
        <input className="mt-1 block w-full rounded-lg border p-2 bg-transparent" type="number" min={1} max={1000} value={rules.repeatEveryVideos} onChange={e => setRules(v => ({ ...v, repeatEveryVideos: Number(e.target.value) }))} />
      </label>
      <label className="block text-sm">विज्ञापन कितने सेकंड दिखे? (डिफॉल्ट 8)
        <input className="mt-1 block w-full rounded-lg border p-2 bg-transparent" type="number" min={1} max={60} value={rules.autoDismissSeconds} onChange={e => setRules(v => ({ ...v, autoDismissSeconds: Number(e.target.value) }))} />
      </label>
      <button disabled={saving} onClick={save} className="rounded-lg bg-[var(--color-primary-button)] px-5 py-2 text-white disabled:opacity-50">{saving ? "Saving..." : "Save Settings"}</button>
    </>}
    {message && <p role="status" className="text-sm">{message}</p>}
  </section>;
}
