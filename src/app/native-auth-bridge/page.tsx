"use client";

import { useEffect } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "@/firebase/config";

declare global {
  interface Window {
    JembeeNativeAuth?: {
      onToken?: (token: string) => void;
      onSignedOut?: () => void;
    };
  }
}

export default function NativeAuthBridgePage() {
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      const bridge = window.JembeeNativeAuth;
      if (!bridge) return;
      if (!user) {
        bridge.onSignedOut?.();
        return;
      }
      try {
        bridge.onToken?.(await user.getIdToken());
      } catch {
        bridge.onSignedOut?.();
      }
    });
    return unsubscribe;
  }, []);

  return (
    <main
      aria-label="JEMBEE PLAY secure app connection"
      style={{ minHeight: "100vh", background: "#080B12", color: "#9AA8BC", display: "grid", placeItems: "center", fontSize: 12 }}
    >
      Connecting secure app session…
    </main>
  );
}
