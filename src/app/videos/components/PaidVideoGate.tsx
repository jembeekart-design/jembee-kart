"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { auth } from "@/firebase/config";

type CashfreeMode = "sandbox" | "production";

declare global {
  interface Window {
    Cashfree?: (options: { mode: CashfreeMode }) => {
      checkout: (options: {
        paymentSessionId: string;
        redirectTarget: "_self";
      }) => Promise<unknown>;
    };
  }
}

let cashfreeScriptPromise: Promise<void> | null = null;

function loadCashfreeScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Checkout is unavailable"));
  if (window.Cashfree) return Promise.resolve();
  if (!cashfreeScriptPromise) {
    cashfreeScriptPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]'
      );
      const script = existing || document.createElement("script");
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      script.onload = () => window.Cashfree ? resolve() : reject(new Error("Cashfree SDK did not initialize"));
      script.onerror = () => reject(new Error("Could not load Cashfree Checkout"));
      if (!existing) document.head.appendChild(script);
    }).catch((error) => {
      cashfreeScriptPromise = null;
      throw error;
    });
  }
  return cashfreeScriptPromise ?? Promise.reject(new Error("Cashfree SDK could not be loaded"));
}

async function createPlaybackSession(videoId: string, token: string) {
  const response = await fetch("/api/shorts/paid-video/playback-session", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ videoId }),
    cache: "no-store",
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.success !== true) {
    throw new Error(result?.error || "Could not authorize video playback");
  }
}

export default function PaidVideoGate({
  videoId,
  price,
  onAuthorized,
}: {
  videoId: string;
  price?: number;
  onAuthorized: () => void;
}) {
  const searchParams = useSearchParams();
  const shareId = searchParams.get("ref") || "";
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  async function handlePurchase() {
    if (busy) return;
    const user = auth.currentUser;
    if (!user) {
      setMessage("Please log in to purchase this video.");
      return;
    }

    const phone = mobileNumber.replace(/\D/g, "");
    if (!/^\d{10}$/.test(phone)) {
      setMessage("कृपया 10 अंकों का सही मोबाइल नंबर भरें।");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const token = await user.getIdToken();
      if (shareId) {
        const claimResponse = await fetch("/api/monetag/share-attribution/claim", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ shareId, videoId }),
          cache: "no-store",
        });
        const claim = await claimResponse.json().catch(() => null);
        if (!claimResponse.ok || claim?.success !== true) throw new Error("Share attribution could not be verified; purchase can continue without referral credit only if you remove the referral link.");
      }
      const response = await fetch("/api/shorts/paid-video/create-order", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId, mobileNumber: phone, ...(shareId ? { shareId } : {}) }),
        cache: "no-store",
      });
      const order = await response.json().catch(() => null);
      if (!response.ok || order?.success !== true) {
        throw new Error(order?.error || "Could not create payment order");
      }

      if (order.alreadyPurchased === true) {
        await createPlaybackSession(videoId, token);
        onAuthorized();
        return;
      }

      if (typeof order.paymentSessionId !== "string" || !order.paymentSessionId) {
        throw new Error("Payment session was not returned by the server");
      }

      await loadCashfreeScript();
      const mode: CashfreeMode = order.environment === "production" ? "production" : "sandbox";
      const cashfree = window.Cashfree?.({ mode });
      if (!cashfree) throw new Error("Cashfree Checkout is unavailable");

      // Cashfree redirects to the server-verification return page.
      await cashfree.checkout({
        paymentSessionId: order.paymentSessionId,
        redirectTarget: "_self",
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Payment could not be started");
      setBusy(false);
    }
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-6 text-center text-white">
      <div className="w-full max-w-sm rounded-2xl border border-white/20 bg-zinc-900 p-6 shadow-2xl">
        <div className="mb-3 text-4xl" aria-hidden="true">🔒</div>
        <h2 className="text-xl font-bold">Paid video</h2>
        <p className="mt-2 text-sm text-white/75">
          Purchase this video to unlock secure playback.
        </p>
        {typeof price === "number" && price > 0 && (
          <p className="mt-3 text-2xl font-extrabold">₹{price.toFixed(2)}</p>
        )}
        <label htmlFor="paid-video-mobile" className="mt-4 block text-left text-sm text-white/80">
          मोबाइल नंबर
        </label>
        <input
          id="paid-video-mobile"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={10}
          value={mobileNumber}
          onChange={(event) => setMobileNumber(event.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="10 अंकों का मोबाइल नंबर"
          disabled={busy}
          className="mt-2 w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white outline-none focus:border-cyan-400"
        />
        <button
          type="button"
          onClick={handlePurchase}
          disabled={busy}
          className="mt-5 w-full rounded-xl bg-cyan-400 px-5 py-3 font-bold text-black disabled:opacity-60"
        >
          {busy ? "Preparing secure checkout…" : "Buy and watch"}
        </button>
        {message && <p role="alert" className="mt-3 text-sm text-red-300">{message}</p>}
        <p className="mt-3 text-xs text-white/50">
          Playback is enabled only after server-side payment verification.
        </p>
      </div>
    </div>
  );
}
