"use client";

import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Activity, AlertTriangle, CheckCircle2, RefreshCw, Save, ShieldCheck, Smartphone, Tv, Wrench } from "lucide-react";
import { auth } from "@/firebase/config";

type Config = {
  configVersion: number;
  maintenance: { enabled: boolean; message: string };
  minimumVersions: { mobile: string; tv: string };
  latestVersions: { mobile: string; tv: string };
  updateUrls: { mobile: string; tv: string };
  features: { shorts: boolean; schoolLearning: boolean; creatorUploads: boolean; paidVideo: boolean; videoAds: boolean; notifications: boolean };
  playback: { autoplay: boolean; preloadNextMetadata: boolean };
};

const defaults: Config = {
  configVersion: 1,
  maintenance: { enabled: false, message: "" },
  minimumVersions: { mobile: "0.1.0", tv: "0.1.0" },
  latestVersions: { mobile: "0.1.0", tv: "0.1.0" },
  updateUrls: { mobile: "", tv: "" },
  features: { shorts: true, schoolLearning: true, creatorUploads: false, paidVideo: false, videoAds: false, notifications: false },
  playback: { autoplay: true, preloadNextMetadata: true },
};

export default function SystemHealthPage() {
  const [config, setConfig] = useState<Config>(defaults);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [healthChecks, setHealthChecks] = useState<Array<{ id: string; label: string; status: string; latencyMs?: number }>>([]);
  const [checkedAt, setCheckedAt] = useState("");

  const load = useCallback(async (idToken?: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/app/remote-config", { cache: "no-store" });
      if (!response.ok) throw new Error("Remote configuration could not be loaded.");
      const result = await response.json();
      if (result.success && result.config) setConfig({ ...defaults, ...result.config });
      if (idToken) {
        setToken(idToken);
        const healthResponse = await fetch("/api/admin/system-health", { headers: { Authorization: `Bearer ${idToken}` }, cache: "no-store" });
        const health = await healthResponse.json();
        if (healthResponse.ok && health.success) { setHealthChecks(health.checks || []); setCheckedAt(health.checkedAt || ""); }
        else setHealthChecks([{ id: "health_api", label: "System health diagnostics", status: "unavailable" }]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => onAuthStateChanged(auth, async (user) => {
    if (!user) { setError("Admin login required."); setLoading(false); return; }
    try { await load(await user.getIdToken()); }
    catch { setError("Could not verify admin session."); setLoading(false); }
  }), [load]);

  function toggleFeature(key: keyof Config["features"]) {
    setConfig((current) => ({ ...current, features: { ...current.features, [key]: !current.features[key] } }));
  }

  async function save() {
    if (!token) { setError("Admin session missing. Reload and sign in again."); return; }
    setSaving(true); setError(""); setStatus("");
    try {
      const patch = {
        maintenance: config.maintenance,
        minimumVersions: config.minimumVersions,
        latestVersions: config.latestVersions,
        updateUrls: config.updateUrls,
        features: config.features,
        playback: config.playback,
      };
      const response = await fetch("/api/app/remote-config", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ expectedConfigVersion: config.configVersion, patch }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Settings could not be saved.");
      setConfig({ ...defaults, ...result.config });
      setStatus("Remote settings saved and audit record created.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally { setSaving(false); }
  }

  const featureLabels: Array<[keyof Config["features"], string, string, boolean]> = [
    ["shorts", "Shorts", "Backend enforcement pending", false],
    ["schoolLearning", "School Learning", "Backend enforcement pending", false],
    ["creatorUploads", "Creator uploads", "Backend enforcement pending", false],
    ["paidVideo", "Paid video", "Enforced at checkout and playback session", true],
    ["videoAds", "Video ads", "Backend enforcement pending", false],
    ["notifications", "Notifications", "Backend enforcement pending", false],
  ];

  if (loading) return <main className="min-h-screen bg-slate-50 p-8 text-slate-700">Loading system controls…</main>;

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-sky-700">JEMBEE PLAY · ADMIN</p>
            <h1 className="mt-2 text-3xl font-black">System Health & Remote Recovery</h1>
            <p className="mt-2 text-sm text-slate-600">Remote settings for compatible website, Android Mobile and Android TV clients.</p>
          </div>
          <button onClick={() => void load(token)} className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-3 font-semibold"><RefreshCw size={17}/> Refresh</button>
        </header>

        <section className="rounded-2xl border bg-white p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-bold">System diagnostics</h2><span className="text-xs text-slate-500">{checkedAt ? `Checked ${new Date(checkedAt).toLocaleString()}` : "Not checked"}</span></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {healthChecks.map((check) => <div key={check.id} className="rounded-xl border p-4"><p className="font-semibold">{check.label}</p><p className={`mt-1 text-sm ${check.status === "healthy" || check.status === "configured" ? "text-emerald-700" : "text-amber-700"}`}>{check.status.replaceAll("_", " ")}{typeof check.latencyMs === "number" ? ` · ${check.latencyMs} ms` : ""}</p></div>)}
          </div>
          <p className="mt-3 text-xs text-slate-500">Provider checks show configuration presence only, not successful live provider transactions.</p>
        </section>
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-white p-5"><Smartphone className="text-sky-700"/><p className="mt-3 font-bold">Android Mobile</p><p className="text-sm text-slate-600">Target {config.latestVersions.mobile}</p></div>
          <div className="rounded-2xl border bg-white p-5"><Tv className="text-sky-700"/><p className="mt-3 font-bold">Android TV</p><p className="text-sm text-slate-600">Target {config.latestVersions.tv}</p></div>
        </section>

        <section className="rounded-2xl border bg-white p-5 md:p-6">
          <div className="flex items-center gap-2"><Wrench className="text-sky-700"/><h2 className="text-xl font-bold">Emergency maintenance</h2></div>
          <label className="mt-5 flex items-center gap-3 font-semibold"><input type="checkbox" checked={config.maintenance.enabled} onChange={(e) => setConfig((c) => ({ ...c, maintenance: { ...c.maintenance, enabled: e.target.checked } }))}/> Enable maintenance notice on compatible apps</label>
          <label className="mt-4 block text-sm font-medium">Maintenance message</label>
          <input maxLength={240} value={config.maintenance.message} onChange={(e) => setConfig((c) => ({ ...c, maintenance: { ...c.maintenance, message: e.target.value } }))} className="mt-2 w-full rounded-xl border p-3" placeholder="We are fixing a temporary issue. Please try again soon."/>
        </section>

        <section className="rounded-2xl border bg-white p-5 md:p-6">
          <h2 className="text-xl font-bold">Feature emergency switches</h2>
          <p className="mt-1 text-sm text-slate-600">These settings are remote config values. Backend enforcement must be implemented separately for each feature before relying on a switch for security.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {featureLabels.map(([key, label, description, supported]) => <label key={key} className="flex items-center justify-between gap-4 rounded-xl border p-4"><span><span className="block font-semibold">{label}</span><span className="text-xs text-slate-500">{description}</span></span><input type="checkbox" disabled={!supported} checked={config.features[key]} onChange={() => toggleFeature(key)} className="h-5 w-5 disabled:opacity-40"/></label>)}
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-5 md:p-6">
          <h2 className="text-xl font-bold">Mobile and TV release versions</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {(["mobile", "tv"] as const).map((platform) => <div key={platform} className="space-y-3 rounded-xl border p-4">
              <h3 className="font-bold">{platform === "mobile" ? "Android Mobile" : "Android TV / Google TV"}</h3>
              <label className="block text-sm">Latest version<input value={config.latestVersions[platform]} onChange={(e) => setConfig((c) => ({ ...c, latestVersions: { ...c.latestVersions, [platform]: e.target.value } }))} className="mt-1 w-full rounded-lg border p-2"/></label>
              <label className="block text-sm">Minimum supported version<input value={config.minimumVersions[platform]} onChange={(e) => setConfig((c) => ({ ...c, minimumVersions: { ...c.minimumVersions, [platform]: e.target.value } }))} className="mt-1 w-full rounded-lg border p-2"/></label>
              <label className="block text-sm">HTTPS update URL<input value={config.updateUrls[platform]} onChange={(e) => setConfig((c) => ({ ...c, updateUrls: { ...c.updateUrls, [platform]: e.target.value } }))} className="mt-1 w-full rounded-lg border p-2" placeholder="https://…"/></label>
            </div>)}
          </div>
        </section>

        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertTriangle className="mr-2 inline" size={16}/>{error}</p>}
        {status && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 className="mr-2 inline" size={16}/>{status}</p>}
        <footer className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4">
          <p className="text-xs text-slate-500">Config version: {config.configVersion} · Changes are versioned and audited.</p>
          <button onClick={() => void save()} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-sky-700 px-5 py-3 font-bold text-white disabled:opacity-50"><Save size={17}/>{saving ? "Saving…" : "Save remote settings"}</button>
        </footer>
      </div>
    </main>
  );
}
