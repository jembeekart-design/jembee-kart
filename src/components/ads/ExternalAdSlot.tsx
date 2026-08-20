"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { getProvider } from "@/lib/ads/providers";
import { AdSlotPlaceholder } from "./AdSlotPlaceholder";
import { AdSlot as AdSlotType, AdNetwork } from "@/types/ads";
import { getApp } from "firebase/app";

/**
 * ExternalAdSlot: Component for rendering external network ads.
 * It is distinct from the internal AdSlot component to preserve internal
 * revenue/event logic.
 */
export function ExternalAdSlot({ slotId }: { slotId: string }) {
  const [config, setConfig] = useState<{ slot: AdSlotType; network: AdNetwork } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConfig() {
      try {
        const db = getFirestore(getApp());
        
        // 1. Fetch Slot Config
        const slotRef = doc(db, "adSlots", slotId);
        const slotSnap = await getDoc(slotRef);
        
        if (!slotSnap.exists()) return;
        
        const slot = slotSnap.data() as AdSlotType;
        if (!slot.enabled) return;

        // 2. Fetch Network Config
        const networkRef = doc(db, "adNetworks", slot.networkId);
        const networkSnap = await getDoc(networkRef);
        
        if (!networkSnap.exists()) return;
        
        const network = networkSnap.data() as AdNetwork;
        if (!network.enabled) return;

        setConfig({ slot, network });
      } catch (err) {
        console.error("Failed to load external ad slot:", err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, [slotId]);

  if (loading || !config) return null;

  const { slot, network } = config;
  const provider = getProvider(network.provider);

  if (!provider) return null;

  // Initialize network scripts safely (idempotent, only runs once)
  provider.initializeScripts(network);

  // Render placeholder in test mode or if not fully configured.
  // In production, this component will be updated to render the live ad slot.
  return <AdSlotPlaceholder slotName={slot.name} networkName={network.name} />;
}
