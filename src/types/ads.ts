import type { Timestamp } from "firebase/firestore";

export type AdNetworkMode = "GAM" | "AdSense_Auto" | "AdSense_Manual" | "Monetag_DirectLink";

export interface AdNetwork {
  id: string;
  name: string;
  mode: AdNetworkMode;
  enabled: boolean;
  environment: "test" | "production";
  priority: number;
  fallbackEnabled: boolean;
  supportedSlots: string[];
  config: Record<string, string>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AdSlot {
  id: string;
  name: string;
  enabled: boolean;
  /** New placements use the fixed Monetag Direct Link provider only. */
  networkId: string;
  format?: "monetag-direct-link";
  environment?: "test" | "production";
  fallbackNetworkId?: string;
  /** For Monetag Direct Link this stores the https Smart Link URL. */
  adUnitId: string;
  placement: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
  /** Optional admin-supplied artwork for a native sponsored feed card. */
  advertiserName?: string;
  creativeImageUrl?: string;
  logoImageUrl?: string;
  priority: number;
  deviceTargeting: Record<string, boolean>;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
