"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getExoClickShortsVastUrl } from "@/lib/ads/exoclick";
import { sendAdDiagnostic } from "@/lib/ads/diagnostics";

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
      CONTENT_PAUSE_REQUESTED: string;
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
  const startedRef = useRef(false);
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
        setError("विज्ञापन लोड नहीं हो पाया। अगला Short चल रहा है…");
        sendAdDiagnostic("sdk_error", "ima", "shorts");
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
      startedRef.current = false;
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

  const startAd = useCallback(() => {
    if (!activeRef.current || startedRef.current || finishedRef.current) return;
    startedRef.current = true;

    const ima = imaRef.current;
    const video = videoRef.current;
    const container = containerRef.current;

    if (!vastUrl || !ima || !video || !container) {
      setError("विज्ञापन उपलब्ध नहीं है। अगला Short चल रहा है…");
      sendAdDiagnostic("ad_error", "exoclick", "shorts");
      finishAd();
      return;
    }

    finishedRef.current = false;
    setLoading(true);
    setError("विज्ञापन लोड हो रहा है…");

    try {
      // Initialize the IMA display and request the ad automatically for the active slot.
      const display = new ima.AdDisplayContainer(container, video);
      // Muted autoplay is used because mobile browsers may block audible autoplay.
      video.muted = true;
      display.initialize();

      const loader = new ima.AdsLoader(display);
      loaderRef.current = loader;
      const request = new ima.AdsRequest();

      request.adTagUrl = vastUrl;
      request.linearAdSlotWidth = Math.max(1, container.clientWidth);
      request.linearAdSlotHeight = Math.max(1, container.clientHeight);
      request.vastLoadTimeout = 8000;

      timeoutRef.current = setTimeout(() => {
        setError("विज्ञापन का समय समाप्त हुआ। अगला Short चल रहा है…");
        sendAdDiagnostic("ad_timeout", "exoclick", "shorts");
        finishAd();
      }, 10000);

      loader.addEventListener(
        ima.AdErrorEvent.Type.AD_ERROR,
        () => {
          setError("अभी विज्ञापन उपलब्ध नहीं है। अगला Short चल रहा है…");
          sendAdDiagnostic("ad_no_fill", "exoclick", "shorts");
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
              ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
              () => sendAdDiagnostic("ad_started", "exoclick", "shorts")
            );

            const completeAd = () => {
              if (!finishedRef.current) sendAdDiagnostic("ad_completed", "exoclick", "shorts");
              finishAd();
            };
            manager.addEventListener(ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, completeAd);
            manager.addEventListener(ima.AdEvent.Type.ALL_ADS_COMPLETED, completeAd);

            manager.addEventListener(
              ima.AdErrorEvent.Type.AD_ERROR,
              () => {
                setError("विज्ञापन चल नहीं पाया। अगला Short चल रहा है…");
                sendAdDiagnostic("ad_error", "exoclick", "shorts");
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
              setError("विज्ञापन प्लेबैक रुक गया। अगला Short चल रहा है…");
              sendAdDiagnostic("ad_timeout", "exoclick", "shorts");
              finishAd();
            }, 60000);

            setLoading(false);
            setPlaying(true);
            setError("");
          } catch {
            setError("विज्ञापन चल नहीं पाया। अगला Short चल रहा है…");
            sendAdDiagnostic("ad_error", "exoclick", "shorts");
            finishAd();
          }
        }
      );

      sendAdDiagnostic("vast_request", "exoclick", "shorts");
      loader.requestAds(request);
    } catch {
      setError("विज्ञापन उपलब्ध नहीं है। अगला Short चल रहा है…");
      sendAdDiagnostic("ad_error", "exoclick", "shorts");
      finishAd();
    }
  }, [vastUrl, finishAd, clearAdTimeout]);

  // Start the VAST request automatically as soon as the active slot and IMA SDK are ready.
  useEffect(() => {
    if (!active || !sdkReady || !vastUrl || startedRef.current || finishedRef.current) return;
    startAd();
  }, [active, sdkReady, vastUrl, startAd]);

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
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/60 p-6 text-center">
          <p className="text-xl font-bold">Sponsored video</p>
          <p className="text-sm text-white/70">
            विज्ञापन अपने-आप लोड होगा। विज्ञापन उपलब्ध न होने पर अगला Short चलेगा।
          </p>
          {error && (
            <p role="status" className="text-sm text-amber-200">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}