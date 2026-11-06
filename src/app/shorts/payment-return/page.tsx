"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";

export default function PaidVideoPaymentReturnPage() {
  const [message, setMessage] = useState("Verifying your payment securely…");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const orderId = new URLSearchParams(window.location.search).get("order_id");

    if (!orderId || !/^[A-Za-z0-9_-]{3,50}$/.test(orderId)) {
      setMessage("Payment order reference is missing or invalid.");
      setFailed(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || cancelled) {
        if (!cancelled) {
          setMessage("Please sign in with the account used for this purchase.");
          setFailed(true);
        }
        return;
      }

      try {
        const token = await user.getIdToken();
        const verifyResponse = await fetch("/api/shorts/paid-video/verify", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId }),
          cache: "no-store",
        });
        const verification = await verifyResponse.json().catch(() => null);
        if (!verifyResponse.ok || verification?.success !== true || verification?.paid !== true || typeof verification?.videoId !== "string") {
          throw new Error("Payment is not confirmed yet. Please check your payment status before trying again.");
        }

        const sessionResponse = await fetch("/api/shorts/paid-video/playback-session", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ videoId: verification.videoId }),
          cache: "no-store",
        });
        const session = await sessionResponse.json().catch(() => null);
        if (!sessionResponse.ok || session?.success !== true) {
          throw new Error("Payment is verified, but secure playback could not be opened. Please revisit the video.");
        }

        if (!cancelled) {
          window.location.replace(`/shorts?paidVideoId=${encodeURIComponent(verification.videoId)}`);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Could not verify payment.");
          setFailed(true);
        }
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-zinc-900 p-6 text-center">
        <h1 className="text-xl font-bold">Jembee Shorts Payment</h1>
        <p className="mt-3 text-sm text-white/75" role="status">{message}</p>
        {failed && (
          <a href="/shorts" className="mt-5 inline-block rounded-xl bg-cyan-400 px-5 py-3 font-bold text-black">
            Return to videos
          </a>
        )}
      </div>
    </main>
  );
}
