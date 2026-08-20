export type AdNetworkProviderType = "GAM" | "AdSense";

export interface AdNetwork {
  id: string;
  name: string;
  provider: AdNetworkProviderType;
  enabled: boolean;
  environment: "test" | "production";
  priority: number;
  fallbackEnabled: boolean;
  supportedSlots: string[];
  config: Record<string, string>; // { publisherId, etc. }
  createdAt: any;
  updatedAt: any;
}

export interface AdSlot {
  id: string;
  name: string;
  enabled: boolean;
  networkId: string;
  fallbackNetworkId?: string;
  adUnitId: string;
  placement: string;
  priority: number;
  deviceTargeting: Record<string, boolean>; // { mobile: true, desktop: true }
  createdAt: any;
  updatedAt: any;
}
