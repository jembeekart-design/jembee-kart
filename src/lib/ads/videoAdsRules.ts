export interface VideoAdsRules {
  enabled: boolean;
  firstAdAfterVideos: number;
  repeatEveryVideos: number;
  autoDismissSeconds: number;
}

export const DEFAULT_VIDEO_ADS_RULES: VideoAdsRules = {
  enabled: false,
  firstAdAfterVideos: 5,
  repeatEveryVideos: 3,
  autoDismissSeconds: 8,
};

export function validateVideoAdsRules(value: unknown): VideoAdsRules {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid video ads rules");
  const rules = value as Record<string, unknown>;
  if (typeof rules.enabled !== "boolean") throw new Error("videoAds.enabled must be boolean");
  for (const [key, min, max] of [["firstAdAfterVideos", 5, 1000], ["repeatEveryVideos", 1, 1000], ["autoDismissSeconds", 1, 60]] as const) {
    const n = rules[key];
    if (!Number.isInteger(n) || Number(n) < min || Number(n) > max) throw new Error(`videoAds.${key} is out of range`);
  }
  return { enabled: rules.enabled, firstAdAfterVideos: Number(rules.firstAdAfterVideos), repeatEveryVideos: Number(rules.repeatEveryVideos), autoDismissSeconds: Number(rules.autoDismissSeconds) };
}
