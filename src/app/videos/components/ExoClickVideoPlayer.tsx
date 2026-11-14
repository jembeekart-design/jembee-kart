"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getExoClickLongVideoVastUrl } from "@/lib/ads/exoclick";

type ImaEvent = {
  getAdsManager(video: HTMLVideoElement): ImaAdsManager;
};

type ImaManagerEvent = {
  getType(): string;
};

type ImaAdsRequest = {
  adTagUrl: string;
  linearAdSlotWidth: number;
  linearAdSlotHeight: number;
};

type ImaDisplayContainer = {
  initialize(): void;
};

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
  AdDisplayContainer: new (
    container: HTMLElement,
    video: HTMLVideoElement
  ) => ImaDisplayContainer;
  AdsLoader: new (container: ImaDisplayContainer) => ImaAdsLoader;
  AdsRequest: new () => ImaAdsRequest;
  AdsManagerLoadedEvent: {
    Type: { ADS_MANAGER_LOADED: string };
  };
  AdErrorEvent: {
    Type: { AD_ERROR: string };
  };
  AdEvent: {
    Type: {
      CONTENT_PAUSE_REQUESTED: string;
      CONTENT_RESUME_REQUESTED: string;
      ALL_ADS_COMPLETED: string;
    };
  };
  ViewMode: { NORMAL: string };
};

declare global {
  interface Window {
    google?: {
      ima?: ImaNamespace;
    };
  }
}

let imaSdkPromise: Promise<ImaNamespace> | null = null;

function loadImaSdk(): Promise<ImaNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Browser unavailable"));
  }

  if (window.google?.ima) {
    return Promise.resolve(window.google.ima);
  }

  if (!imaSdkPromise) {
    imaSdkPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://imasdk.googleapis.com/js/sdkloader/ima3.js";
      script.async = true;

      script.onload = () => {
        const ima = window.google?.ima;
        if (ima) resolve(ima);
        else reject(new Error("IMA SDK unavailable"));
      };

      script.onerror = () => {
        imaSdkPromise = null;
        reject(new Error("IMA SDK failed to load"));
      };

      document.head.appendChild(script);
    });
  }

  return imaSdkPromise;
}

export default function ExoClickVideoPlayer({
  src,
  poster,
  title,
}: {
  src: string;
  poster?: string;
  title?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const adContainerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<ImaAdsManager | null>(null);
  const loaderRef = useRef<ImaAdsLoader | null>(null);
  const adTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentStartedRef = useRef(false);
  const adAttemptedRef = useRef(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [contentStarted, setContentStarted] = useState(false);
  const [adPlaying, setAdPlaying] = useState(false);
  const [message, setMessage] = useState("");

  const vastUrl = getExoClickLongVideoVastUrl();

  useEffect(() => {
    if (!vastUrl) return;

    let active = true;

    loadImaSdk()
      .then(() => {
        if (active) setSdkReady(true);
      })
      .catch(() => {
        if (active) setMessage("Ad service unavailable. Video is ready.");
      });

    return () => {
      active = false;
    };
  }, [vastUrl]);

  const playContent = useCallback(() => {
    if (adTimeoutRef.current !== null) {
      clearTimeout(adTimeoutRef.current);
      adTimeoutRef.current = null;
    }
    const manager = managerRef.current;
    managerRef.current = null;
    try { manager?.destroy(); } catch { /* Ignore IMA cleanup errors. */ }
    const loader = loaderRef.current;
    loaderRef.current = null;
    try { loader?.destroy(); } catch { /* Ignore IMA cleanup errors. */ }

    const video = videoRef.current;
    if (!video) return;

    setAdPlaying(false);
    setContentStarted(true);
    contentStartedRef.current = true;

    void video.play().catch(() => {
      setMessage("Tap Play to start the video.");
    });
  }, []);

  const startPlayback = useCallback(() => {
    const video = videoRef.current;

    if (!video) return;
    if (contentStartedRef.current) {
      void video.play().catch(() => {});
      return;
    }

    if (!vastUrl || !sdkReady || !window.google?.ima || adAttemptedRef.current) {
      playContent();
      return;
    }

    const ima = window.google.ima;
    const adContainer = adContainerRef.current;

    if (!adContainer) {
      playContent();
      return;
    }

    adAttemptedRef.current = true;
    setMessage("Loading advertisement…");

    try {
      const display = new ima.AdDisplayContainer(adContainer, video);

      // Must run directly from the user's Play interaction.
      display.initialize();

      const loader = new ima.AdsLoader(display);
      loaderRef.current = loader;
      adTimeoutRef.current = setTimeout(() => {
        setMessage("Advertisement timed out. Starting video…");
        playContent();
      }, 10000);
      const request = new ima.AdsRequest();

      request.adTagUrl = vastUrl;
      request.linearAdSlotWidth = Math.max(1, video.clientWidth);
      request.linearAdSlotHeight = Math.max(1, video.clientHeight);

      loader.addEventListener(
        ima.AdErrorEvent.Type.AD_ERROR,
        () => playContent()
      );

      loader.addEventListener(
        ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        (event) => {
          if (adTimeoutRef.current !== null) {
            clearTimeout(adTimeoutRef.current);
            adTimeoutRef.current = null;
          }
          try {
            const manager = event.getAdsManager(video);
            managerRef.current = manager;

            manager.addEventListener(
              ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
              () => {
                video.pause();
                setAdPlaying(true);
                setMessage("");
              }
            );

            manager.addEventListener(
              ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
              () => playContent()
            );

            manager.addEventListener(
              ima.AdEvent.Type.ALL_ADS_COMPLETED,
              () => playContent()
            );

            manager.addEventListener(
              ima.AdErrorEvent.Type.AD_ERROR,
              () => playContent()
            );

            manager.init(
              Math.max(1, video.clientWidth),
              Math.max(1, video.clientHeight),
              ima.ViewMode.NORMAL
            );

            manager.start();
          } catch {
            playContent();
          }
        }
      );

      loader.requestAds(request);
    } catch {
      playContent();
    }
  }, [vastUrl, sdkReady, playContent]);

  useEffect(() => {
    return () => {
      if (adTimeoutRef.current !== null) clearTimeout(adTimeoutRef.current);
      adTimeoutRef.current = null;
      try { managerRef.current?.destroy(); } catch { /* Ignore IMA cleanup errors. */ }
      managerRef.current = null;
      try { loaderRef.current?.destroy(); } catch { /* Ignore IMA cleanup errors. */ }
      loaderRef.current = null;
    };
  }, []);

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls={contentStarted && !adPlaying}
        playsInline
        preload="metadata"
        className="h-full w-full bg-black object-contain"
        aria-label={title || "JEMBEE PLAY video"}
        onEnded={() => {
          contentStartedRef.current = false;
          setContentStarted(false);
        }}
      />

      <div
        ref={adContainerRef}
        className={`absolute inset-0 z-10 ${adPlaying ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-label="Advertisement player"
      />

      {!contentStarted && !adPlaying ? (
        <button
          type="button"
          onClick={startPlayback}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/25 text-white"
          aria-label="Play video"
        >
          <span className="rounded-full bg-cyan-400 px-7 py-4 font-bold text-slate-950">
            ▶ Play
          </span>
        </button>
      ) : null}

      {message ? (
        <p
          role="status"
          className="absolute bottom-3 left-3 z-30 rounded-lg bg-black/75 px-3 py-2 text-xs text-white"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
