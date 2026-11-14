"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getExoClickShortsVastUrl } from "@/lib/ads/exoclick";

type ImaManager = {
  addEventListener(type: string, listener: (event: unknown) => void): void;
  init(width: number, height: number, viewMode: string): void;
  start(): void;
  destroy(): void;
};

type ImaRequest = {
  adTagUrl: string;
  linearAdSlotWidth: number;
  linearAdSlotHeight: number;
  vastLoadTimeout?: number;
};

type ImaLoader = {
  addEventListener(
    type: string,
    listener: (event: {
      getAdsManager(video: HTMLVideoElement): ImaManager;
    }) => void
  ): void;
  requestAds(request: ImaRequest): void;
  destroy(): void;
};

type ImaNamespace = {
  AdDisplayContainer: new (
    container: HTMLElement,
    video: HTMLVideoElement
  ) => { initialize(): void };
  AdsLoader: new (container: { initialize(): void }) => ImaLoader;
  AdsRequest: new () => ImaRequest;
  AdsManagerLoadedEvent: { Type: { ADS_MANAGER_LOADED: string } };
  AdErrorEvent: { Type: { AD_ERROR: string } };
  AdEvent: {
    Type: {
      CONTENT_RESUME_REQUESTED: string;
      ALL_ADS_COMPLETED: string;
    };
  };
  ViewMode: { NORMAL: string };
};

function getImaFromWindow(): ImaNamespace | undefined {
  return (window as unknown as {
    google?: { ima?: ImaNamespace };
  }).google?.ima;
}

let sdkPromise: Promise<ImaNamespace> | null = null;

function loadIma(): Promise<ImaNamespace> {
  const existing = getImaFromWindow();
  if (existing) return Promise.resolve(existing);

  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://imasdk.googleapis.com/js/sdkloader/ima3.js";
      script.async = true;

      script.onload = () => {
        const ima = getImaFromWindow();
        if (ima) {
          resolve(ima);
        } else {
          sdkPromise = null;
          reject(new Error("IMA SDK unavailable"));
        }
      };

      script.onerror = () => {
        sdkPromise = null;
        reject(new Error("IMA SDK failed"));
      };

      document.head.appendChild(script);
    });
  }

  return sdkPromise;
}

type Props = {
  active: boolean;
  onContinue: () => void;
};

export default function ExoClickShortsAd({
  active,
  onContinue,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<ImaManager | null>(null);
  const loaderRef = useRef<ImaLoader | null>(null);
  const imaRef = useRef<ImaNamespace | null>(null);
  const activeRef = useRef(active);
  const finishedRef = useRef(false);
  const onContinueRef = useRef(onContinue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");

  const vastUrl = getExoClickShortsVastUrl();
  const adIsPlaying = active && playing;

  useEffect(() => {
    onContinueRef.current = onContinue;
  }, [onContinue]);

  const clearAdTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const finishAd = useCallback(() => {
    if (finishedRef.current) return;

    finishedRef.current = true;
    clearAdTimeout();

    const manager = managerRef.current;
    managerRef.current = null;

    try {
      manager?.destroy();
    } catch {
      // Ignore IMA cleanup errors.
    }

    const loader = loaderRef.current;
    loaderRef.current = null;

    try {
      loader?.destroy();
    } catch {
      // Ignore IMA loader cleanup errors.
    }

    videoRef.current?.pause();
    setPlaying(false);
    setLoading(false);

    if (activeRef.current) {
      onContinueRef.current();
    }
  }, [clearAdTimeout]);

  // Load the IMA SDK while this ad slot is active.
  useEffect(() => {
    if (!active) return;

    if (!vastUrl) return;

    let cancelled = false;

    loadIma()
      .then((ima) => {
        if (cancelled) return;
        imaRef.current = ima;
        setSdkReady(true);
        setError("");
      })
      .catch(() => {
        if (cancelled) return;
        setSdkReady(false);
        setError("Advertisement could not be loaded. Continuing…");
        finishAd();
      });

    return () => {
      cancelled = true;
    };
  }, [active, vastUrl, finishAd]);

  // Destroy the ad immediately when the user swipes away.
  useEffect(() => {
    activeRef.current = active;

    if (active) {
      finishedRef.current = false;
      return;
    }

    finishedRef.current = true;
    clearAdTimeout();

    const manager = managerRef.current;
    managerRef.current = null;

    try {
      manager?.destroy();
    } catch {
      // Ignore IMA cleanup errors.
    }

    const loader = loaderRef.current;
    loaderRef.current = null;

    try {
      loader?.destroy();
    } catch {
      // Ignore IMA loader cleanup errors.
    }

    videoRef.current?.pause();

    // Defer UI reset until after the effect has completed.
    Promise.resolve().then(() => {
      if (!activeRef.current) {
        setPlaying(false);
        setLoading(false);
      }
    });
  }, [active, clearAdTimeout]);

  useEffect(() => {
    const video = videoRef.current;

    return () => {
      activeRef.current = false;
      finishedRef.current = true;
      clearAdTimeout();

      const manager = managerRef.current;
      managerRef.current = null;

      try {
        manager?.destroy();
      } catch {
        // Ignore IMA manager cleanup errors.
      }

      const loader = loaderRef.current;
      loaderRef.current = null;

      try {
        loader?.destroy();
      } catch {
        // Ignore IMA loader cleanup errors.
      }

      video?.pause();
    };
  }, [clearAdTimeout]);

  const startAd = () => {
    if (!activeRef.current || loading || adIsPlaying) return;

    const ima = imaRef.current;
    const video = videoRef.current;
    const container = containerRef.current;

    if (!vastUrl || !ima || !video || !container) {
      setError("Advertisement unavailable. Continuing…");
      finishAd();
      return;
    }

    finishedRef.current = false;
    setLoading(true);
    setError("Loading advertisement…");

    try {
      // IMA requires initialization directly inside the user's click.
      const display = new ima.AdDisplayContainer(container, video);
      display.initialize();

      const loader = new ima.AdsLoader(display);
      loaderRef.current = loader;
      const request = new ima.AdsRequest();

      request.adTagUrl = vastUrl;
      request.linearAdSlotWidth = Math.max(1, container.clientWidth);
      request.linearAdSlotHeight = Math.max(1, container.clientHeight);
      request.vastLoadTimeout = 8000;

      timeoutRef.current = setTimeout(() => {
        setError("Advertisement timed out. Continuing…");
        finishAd();
      }, 10000);

      loader.addEventListener(
        ima.AdErrorEvent.Type.AD_ERROR,
        () => {
          setError("No advertisement available. Continuing…");
          finishAd();
        }
      );

      loader.addEventListener(
        ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        (event) => {
          let manager: ImaManager;

          try {
            manager = event.getAdsManager(video);
          } catch {
            finishAd();
            return;
          }

          if (!activeRef.current || finishedRef.current) {
            try {
              manager.destroy();
            } catch {
              // Ignore stale manager cleanup errors.
            }
            return;
          }

          try {
            managerRef.current = manager;

            manager.addEventListener(
              ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
              () => finishAd()
            );

            manager.addEventListener(
              ima.AdEvent.Type.ALL_ADS_COMPLETED,
              () => finishAd()
            );

            manager.addEventListener(
              ima.AdErrorEvent.Type.AD_ERROR,
              () => {
                setError("Advertisement failed. Continuing…");
                finishAd();
              }
            );

            manager.init(
              Math.max(1, container.clientWidth),
              Math.max(1, container.clientHeight),
              ima.ViewMode.NORMAL
            );

            manager.start();

            clearAdTimeout();
            timeoutRef.current = setTimeout(() => {
              setError("Advertisement ended. Continuing…");
              finishAd();
            }, 60000);

            setLoading(false);
            setPlaying(true);
            setError("");
          } catch {
            setError("Advertisement failed. Continuing…");
            finishAd();
          }
        }
      );

      loader.requestAds(request);
    } catch {
      setError("Advertisement unavailable. Continuing…");
      finishAd();
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-black text-white">
      <video
        ref={videoRef}
        playsInline
        preload="none"
        className="absolute inset-0 h-full w-full object-contain"
        aria-label="Sponsored advertisement"
      />

      <div
        ref={containerRef}
        className={`absolute inset-0 z-20 ${
          adIsPlaying ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-label="ExoClick advertisement controls"
      />

      <div className="absolute left-4 top-6 z-30 rounded-full bg-black/70 px-3 py-2 text-xs font-bold">
        Sponsored · JEMBEE PLAY
      </div>

      {!adIsPlaying && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 bg-black/60 p-6 text-center">
          <p className="text-xl font-bold">Sponsored video</p>

          <p className="text-sm text-white/70">
            Advertisement may be available. Your next Short is always accessible.
          </p>

          <button
            type="button"
            disabled={!active || loading || !sdkReady}
            onClick={startAd}
            className="rounded-full bg-cyan-400 px-7 py-3 font-bold text-slate-950 disabled:opacity-50"
          >
            {loading
              ? "Loading…"
              : sdkReady
                ? "▶ Play Ad"
                : "Preparing advertisement…"}
          </button>

          {error && (
            <p role="status" className="text-sm text-amber-200">
              {error}
            </p>
          )}

          <button
            type="button"
            disabled={!active}
            onClick={onContinue}
            className="rounded-full border border-white/30 px-6 py-2 text-sm font-semibold disabled:opacity-50"
          >
            Continue to next Short
          </button>
        </div>
      )}
    </div>
  );
}