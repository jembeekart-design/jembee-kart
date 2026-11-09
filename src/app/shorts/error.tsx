"use client";

import { useEffect } from "react";

export default function ShortsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("JEMBEE PLAY Shorts route failed to render:", error);
  }, [error]);

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white">
      <h1 className="text-2xl font-bold">Shorts अभी लोड नहीं हो पाया</h1>
      <p className="max-w-sm text-sm text-white/70">
        इंटरनेट कनेक्शन जाँचें और फिर से कोशिश करें। समस्या बनी रहे तो थोड़ी देर बाद दोबारा खोलें।
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-full bg-white px-6 py-3 font-semibold text-black"
      >
        फिर से कोशिश करें
      </button>
    </main>
  );
}
