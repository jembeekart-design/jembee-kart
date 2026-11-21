"use client";

import { useEffect, useState } from "react";

type Platform = "mobile" | "tv" | "web";
type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }> };
type ReleaseInfo = { versionName: string; sizeBytes: number; downloadUrl: string; releaseNotes?: string };

export default function AppInstallActions({ platform, downloadUrl = "" }: { platform: Platform; downloadUrl?: string }) {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [release, setRelease] = useState<ReleaseInfo | null>(null);
  const [releaseLoading, setReleaseLoading] = useState(platform !== "web" && !downloadUrl);

  useEffect(() => {
    if (platform !== "web") return;
    const onPrompt = (event: Event) => { event.preventDefault(); setInstallEvent(event as InstallPromptEvent); };
    const onInstalled = () => { setIsInstalled(true); setInstallEvent(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [platform]);

  useEffect(() => {
    if (platform === "web" || downloadUrl) return;
    let active = true;
    fetch("/api/app/releases/" + platform, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Release unavailable");
        return response.json();
      })
      .then((data) => {
        if (active && data.success && data.available) {
          setRelease({ versionName: data.versionName, sizeBytes: data.sizeBytes, downloadUrl: data.downloadUrl, releaseNotes: data.releaseNotes });
        }
      })
      .catch(() => { if (active) setRelease(null); })
      .finally(() => { if (active) setReleaseLoading(false); });
    return () => { active = false; };
  }, [platform, downloadUrl]);

  async function installWebApp() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }

  if (platform === "web") {
    if (isInstalled) return <span className="inline-flex rounded-full bg-emerald-100 px-5 py-3 text-sm font-bold text-emerald-800">Website app installed</span>;
    if (installEvent) return <button type="button" onClick={installWebApp} className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-extrabold text-slate-950 hover:bg-cyan-300">Install Website App</button>;
    return <p className="max-w-xs text-sm text-slate-300">If your browser supports installation, use its menu and choose “Install app” or “Add to Home Screen”.</p>;
  }

  const activeUrl = downloadUrl || release?.downloadUrl || "";
  if (releaseLoading) return <p className="text-sm text-slate-500">Checking latest signed APK release…</p>;
  if (!activeUrl) return <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4"><span className="block text-sm font-bold text-slate-800">Direct download is not published yet</span><span className="mt-1 block text-xs leading-5 text-slate-500">The signed {platform === "mobile" ? "mobile" : "TV"} APK URL will appear here after release verification.</span></div>;

  return <div className="space-y-2"><a href={activeUrl} rel="nofollow" className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800">Download Android {platform === "mobile" ? "Mobile" : "TV"} APK</a>{release && <p className="text-xs text-slate-500">Version {release.versionName} · {(release.sizeBytes / 1024 / 1024).toFixed(1)} MB</p>}{release?.releaseNotes && <p className="text-xs text-slate-500">{release.releaseNotes}</p>}</div>;
}
