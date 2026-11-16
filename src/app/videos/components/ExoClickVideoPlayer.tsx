"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getExoClickLongVideoVastUrl } from "@/lib/ads/exoclick";
import type { LongVideoAdAudienceRules } from "@/lib/ads/videoAdsRules";
import { sendAdDiagnostic } from "@/lib/ads/diagnostics";
import { auth } from "@/firebase/config";

type ImaEvent = { getAdsManager(video: HTMLVideoElement): ImaAdsManager };
type ImaManagerEvent = { getType(): string };
type ImaAdsRequest = {
  adTagUrl: string;
  linearAdSlotWidth: number;
  linearAdSlotHeight: number;
  vastLoadTimeout?: number;
};
type ImaDisplayContainer = { initialize(): void; destroy?(): void };
type ImaAdsManager = {
  addEventListener(type: string, listener: (event: ImaManagerEvent) => void): void;
  init(width: number, height: number, viewMode: string): void;
  start(): void;
  destroy(): void;
};
type ImaAdsLoader = {
  addEventListener(type: string, listener: (event: ImaEvent) => void): void;
  requestAds(request: ImaAdsRequest): void;
  destroy(): void;
};
type ImaNamespace = {
  AdDisplayContainer: new (container: HTMLElement, video: HTMLVideoElement) => ImaDisplayContainer;
  AdsLoader: new (container: ImaDisplayContainer) => ImaAdsLoader;
  AdsRequest: new () => ImaAdsRequest;
  AdsManagerLoadedEvent: { Type: { ADS_MANAGER_LOADED: string } };
  AdErrorEvent: { Type: { AD_ERROR: string } };
  AdEvent: { Type: { CONTENT_PAUSE_REQUESTED: string; CONTENT_RESUME_REQUESTED: string; ALL_ADS_COMPLETED: string } };
  ViewMode: { NORMAL: string };
};
declare global { interface Window { google?: { ima?: ImaNamespace } } }
let imaSdkPromise: Promise<ImaNamespace> | null = null;

function loadImaSdk(): Promise<ImaNamespace> {
  if (typeof window === "undefined") return Promise.reject(new Error("Browser unavailable"));
  if (window.google?.ima) return Promise.resolve(window.google.ima);
  if (!imaSdkPromise) {
    imaSdkPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://imasdk.googleapis.com/js/sdkloader/ima3.js";
      script.async = true;
      script.onload = () => window.google?.ima ? resolve(window.google.ima) : reject(new Error("IMA SDK unavailable"));
      script.onerror = () => { imaSdkPromise = null; reject(new Error("IMA SDK failed to load")); };
      document.head.appendChild(script);
    });
  }
  return imaSdkPromise;
}

type PublicVideoAdConfig = { masterEnabled?: boolean; providerReady?: boolean; longVideoAds?: { enabled?: boolean; free?: LongVideoAdAudienceRules; paid?: LongVideoAdAudienceRules } };

export default function ExoClickVideoPlayer({
  src, poster, title, videoAccess = "free", videoId,
}: { src: string; poster?: string; title?: string; videoAccess?: "free" | "paid"; videoId?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const adContainerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<ImaAdsManager | null>(null);
  const displayRef = useRef<ImaDisplayContainer | null>(null);
  const loaderRef = useRef<ImaAdsLoader | null>(null);
  const adTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentStartedRef = useRef(false);
  const lastHistorySaveRef = useRef(0);
  const restoredPositionRef = useRef(false);
  const adInProgressRef = useRef(false);
  const adCountRef = useRef(0);
  const lastAdAtRef = useRef(-Infinity);
  const scheduleRef = useRef<number[]>([]);
  const consumedBreaksRef = useRef<Set<number>>(new Set());
  const [sdkReady, setSdkReady] = useState(false);
  const [config, setConfig] = useState<PublicVideoAdConfig | null>(null);
  const [contentStarted, setContentStarted] = useState(false);
  const [adPlaying, setAdPlaying] = useState(false);
  const [message, setMessage] = useState("");
  const vastUrl = getExoClickLongVideoVastUrl();
  const audienceRules = videoAccess === "paid" ? config?.longVideoAds?.paid : config?.longVideoAds?.free;
  const adsEnabled = Boolean(vastUrl && config?.masterEnabled && config.providerReady && config.longVideoAds?.enabled && audienceRules?.enabled);
  const midrollSchedule = useMemo(() => {
    if (!audienceRules) return [];
    const candidates = [...audienceRules.customBreaksSeconds];
    if (audienceRules.firstMidrollSeconds > 0) {
      for (let at = audienceRules.firstMidrollSeconds, count = 0; at <= 86400 && count < audienceRules.maxAdsPerVideo; at += audienceRules.repeatIntervalSeconds, count++) candidates.push(at);
    }
    const sorted = [...new Set(candidates)].filter((n) => Number.isFinite(n) && n >= 30).sort((a, b) => a - b);
    const result: number[] = [];
    for (const at of sorted) {
      if (result.length >= audienceRules.maxAdsPerVideo) break;
      if (!result.length || at - result[result.length - 1] >= audienceRules.minGapSeconds) result.push(at);
    }
    return result;
  }, [audienceRules]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/videos/video-ads", { cache: "no-store", signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data: PublicVideoAdConfig | null) => { if (!controller.signal.aborted && data) setConfig(data); })
      .catch(() => { if (!controller.signal.aborted) setConfig(null); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!adsEnabled) return;
    let active = true;
    loadImaSdk().then(() => { if (active) setSdkReady(true); }).catch(() => { if (active) { setMessage("Ad service unavailable. Video will play without ads."); sendAdDiagnostic("sdk_error", "ima", "long-video"); } });
    return () => { active = false; };
  }, [adsEnabled]);

  useEffect(() => { scheduleRef.current = midrollSchedule; }, [midrollSchedule]);

  const clearAdResources = useCallback(() => {
    if (adTimeoutRef.current !== null) clearTimeout(adTimeoutRef.current);
    adTimeoutRef.current = null;
    try { managerRef.current?.destroy(); } catch { /* IMA cleanup is best effort. */ }
    managerRef.current = null;
    try { loaderRef.current?.destroy(); } catch { /* IMA cleanup is best effort. */ }
    loaderRef.current = null;
  }, []);

  const resumeContent = useCallback(() => {
    clearAdResources();
    adInProgressRef.current = false;
    setAdPlaying(false);
    setMessage("");
    const video = videoRef.current;
    if (video && contentStartedRef.current) void video.play().catch(() => setMessage("Tap Play to continue the video."));
  }, [clearAdResources]);

  const requestAd = useCallback((isPreroll: boolean) => {
    const video = videoRef.current;
    const container = adContainerRef.current;
    const ima = window.google?.ima;
    if (!video || !container || !ima || !adsEnabled || !sdkReady || adInProgressRef.current) {
      if (isPreroll && video) { contentStartedRef.current = true; setContentStarted(true); void video.play().catch(() => setMessage("Tap Play to start the video.")); }
      return;
    }
    adInProgressRef.current = true;
    video.pause();
    setAdPlaying(true);
    setMessage("Loading advertisement…");
    sendAdDiagnostic("vast_request", "exoclick", "long-video");
    const finishAd = () => {
      if (!adInProgressRef.current) return;
      adCountRef.current += 1;
      // Pre-roll does not consume the first-midroll spacing window; minGapSeconds
      // applies between mid-roll breaks, so a configured 30s first break remains reachable.
      if (!isPreroll) lastAdAtRef.current = video.currentTime;
      resumeContent();
    };
    try {
      const display = displayRef.current ?? new ima.AdDisplayContainer(container, video);
      displayRef.current = display;
      const loader = new ima.AdsLoader(display);
      loaderRef.current = loader;
      adTimeoutRef.current = setTimeout(() => {
        setMessage("Advertisement timed out. Continuing video…");
        sendAdDiagnostic("ad_timeout", "exoclick", "long-video");
        finishAd();
      }, 10000);
      const request = new ima.AdsRequest();
      request.adTagUrl = vastUrl!;
      request.linearAdSlotWidth = Math.max(1, video.clientWidth);
      request.linearAdSlotHeight = Math.max(1, video.clientHeight);
      request.vastLoadTimeout = 8000;
      loader.addEventListener(ima.AdErrorEvent.Type.AD_ERROR, () => {
        sendAdDiagnostic("ad_error", "exoclick", "long-video");
        finishAd();
      });
      loader.addEventListener(ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, (event) => {
        if (adTimeoutRef.current !== null) clearTimeout(adTimeoutRef.current);
        adTimeoutRef.current = setTimeout(() => {
          setMessage("Advertisement took too long. Continuing video…");
          sendAdDiagnostic("ad_timeout", "exoclick", "long-video");
          finishAd();
        }, 60_000);
        try {
          const manager = event.getAdsManager(video);
          managerRef.current = manager;
          manager.addEventListener(ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, () => { setAdPlaying(true); setMessage(""); sendAdDiagnostic("ad_started", "exoclick", "long-video"); });
          const completeAd = () => { if (!adInProgressRef.current) return; sendAdDiagnostic("ad_completed", "exoclick", "long-video"); finishAd(); };
          manager.addEventListener(ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, completeAd);
          manager.addEventListener(ima.AdEvent.Type.ALL_ADS_COMPLETED, completeAd);
          manager.addEventListener(ima.AdErrorEvent.Type.AD_ERROR, () => { sendAdDiagnostic("ad_error", "exoclick", "long-video"); finishAd(); });
          manager.init(Math.max(1, video.clientWidth), Math.max(1, video.clientHeight), ima.ViewMode.NORMAL);
          manager.start();
        } catch { sendAdDiagnostic("ad_error", "exoclick", "long-video"); finishAd(); }
      });
      loader.requestAds(request);
    } catch {
      sendAdDiagnostic("ad_error", "exoclick", "long-video");
      finishAd();
    }
  }, [adsEnabled, sdkReady, vastUrl, resumeContent]);

  const startPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (contentStartedRef.current) { void video.play().catch(() => {}); return; }
    contentStartedRef.current = true;
    setContentStarted(true);
    if (adsEnabled && sdkReady && window.google?.ima && adContainerRef.current) {
      try {
        const display = new window.google.ima.AdDisplayContainer(adContainerRef.current, video);
        display.initialize();
        displayRef.current = display;
      } catch { displayRef.current = null; }
    }
    if (adsEnabled && audienceRules?.preRollEnabled && sdkReady && displayRef.current) { requestAd(true); return; }
    void video.play().catch(() => setMessage("Tap Play to start the video."));
  }, [adsEnabled, audienceRules?.preRollEnabled, sdkReady, requestAd]);

  const saveWatchProgress = useCallback(async () => {
    const video = videoRef.current;
    const user = auth.currentUser;
    if (!videoId || videoAccess !== "free" || !user || !video || !Number.isFinite(video.duration) || video.duration <= 0) return;
    const now = Date.now();
    if (now - lastHistorySaveRef.current < 15000) return;
    lastHistorySaveRef.current = now;
    try {
      const token = await user.getIdToken();
      await fetch("/api/videos/watch-history", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ videoId, positionSeconds: video.currentTime, durationSeconds: video.duration }),
        keepalive: true,
      });
    } catch { /* History must never interrupt playback. */ }
  }, [videoId, videoAccess]);

  const restoreWatchProgress = useCallback(async () => {
    const user = auth.currentUser;
    const video = videoRef.current;
    if (!videoId || videoAccess !== "free" || !user || !video || restoredPositionRef.current) return;
    restoredPositionRef.current = true;
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/videos/watch-history", {
        headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
      });
      const result = await response.json().catch(() => null);
      const record = response.ok && Array.isArray(result?.history)
        ? result.history.find((item: { videoId?: string }) => item.videoId === videoId)
        : null;
      if (record && Number.isFinite(record.positionSeconds) && record.positionSeconds > 5 &&
          Number.isFinite(record.durationSeconds) && record.positionSeconds < record.durationSeconds - 10 &&
          video.readyState >= HTMLMediaElement.HAVE_METADATA) {
        video.currentTime = record.positionSeconds;
      }
    } catch { /* Resume is optional; playback remains available. */ }
  }, [videoId, videoAccess]);

  const checkMidroll = useCallback(() => {
    const video = videoRef.current;
    if (!video || !adsEnabled || !sdkReady || !contentStartedRef.current || adInProgressRef.current) return;
    if (video.paused || video.seeking || video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) return;
    if (adCountRef.current >= (audienceRules?.maxAdsPerVideo ?? 0)) return;
    const due = scheduleRef.current.find((at) => at <= video.currentTime && !consumedBreaksRef.current.has(at));
    if (due === undefined) return;
    consumedBreaksRef.current.add(due);
    if (video.currentTime - lastAdAtRef.current < (audienceRules?.minGapSeconds ?? 300)) return;
    requestAd(false);
  }, [adsEnabled, sdkReady, audienceRules?.maxAdsPerVideo, audienceRules?.minGapSeconds, requestAd]);

  useEffect(() => {
    return () => {
      clearAdResources();
      try { displayRef.current?.destroy?.(); } catch { /* IMA cleanup is best effort. */ }
      displayRef.current = null;
      adInProgressRef.current = false;
    };
  }, [clearAdResources]);

  useEffect(() => {
    contentStartedRef.current = false;
    restoredPositionRef.current = false;
    lastHistorySaveRef.current = 0;
    adInProgressRef.current = false;
    adCountRef.current = 0;
    lastAdAtRef.current = -Infinity;
    consumedBreaksRef.current = new Set();
    setContentStarted(false);
    setAdPlaying(false);
    setMessage("");
    clearAdResources();
    try { displayRef.current?.destroy?.(); } catch { /* IMA cleanup is best effort. */ }
    displayRef.current = null;
  }, [src, clearAdResources]);

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black">
      <video ref={videoRef} src={src} poster={poster} controls={contentStarted && !adPlaying} playsInline preload="metadata" className="h-full w-full bg-black object-contain" aria-label={title || "JEMBEE PLAY video"} onLoadedMetadata={() => { void restoreWatchProgress(); }} onPlay={() => { void restoreWatchProgress(); }} onTimeUpdate={() => { checkMidroll(); if (!videoRef.current?.paused && !adPlaying) void saveWatchProgress(); }} onPause={() => { void saveWatchProgress(); }} onWaiting={() => { /* Playback-time schedule naturally pauses while buffering. */ }} onEnded={() => { lastHistorySaveRef.current = 0; void saveWatchProgress(); contentStartedRef.current = false; setContentStarted(false); }} />
      <div ref={adContainerRef} className={`absolute inset-0 z-10 ${adPlaying ? "pointer-events-auto" : "pointer-events-none"}`} aria-label="Advertisement player" />
      {!contentStarted && !adPlaying ? (
        <button type="button" onClick={startPlayback} className="absolute inset-0 z-20 flex items-center justify-center bg-black/25 text-white" aria-label="Play video">
          <span className="rounded-full bg-cyan-400 px-7 py-4 font-bold text-slate-950">▶ Play</span>
        </button>
      ) : null}
      {message ? <p role="status" className="absolute bottom-3 left-3 z-30 rounded-lg bg-black/75 px-3 py-2 text-xs text-white">{message}</p> : null}
    </div>
  );
}
