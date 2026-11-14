export interface LongVideoAdAudienceRules {
  enabled: boolean;
  preRollEnabled: boolean;
  firstMidrollSeconds: number;
  repeatIntervalSeconds: number;
  customBreaksSeconds: number[];
  maxAdsPerVideo: number;
  minGapSeconds: number;
}

export interface LongVideoAdsRules {
  enabled: boolean;
  free: LongVideoAdAudienceRules;
  paid: LongVideoAdAudienceRules;
}

export interface VideoAdsRules {
  /** Master switch for all supported advertisement placements. */
  masterEnabled: boolean;
  enabled: boolean;
  firstAdAfterVideos: number;
  repeatEveryVideos: number;
  autoDismissSeconds: number;
  longVideoAds: LongVideoAdsRules;
}

const DEFAULT_LONG_VIDEO_AUDIENCE_RULES: LongVideoAdAudienceRules = {
  enabled: false,
  preRollEnabled: false,
  firstMidrollSeconds: 30,
  repeatIntervalSeconds: 600,
  customBreaksSeconds: [],
  maxAdsPerVideo: 6,
  minGapSeconds: 300,
};

export const DEFAULT_VIDEO_ADS_RULES: VideoAdsRules = {
  masterEnabled: false,
  enabled: false,
  firstAdAfterVideos: 5,
  repeatEveryVideos: 3,
  autoDismissSeconds: 8,
  longVideoAds: {
    enabled: false,
    free: { ...DEFAULT_LONG_VIDEO_AUDIENCE_RULES },
    paid: { ...DEFAULT_LONG_VIDEO_AUDIENCE_RULES },
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateAudienceRules(
  value: unknown,
  label: string,
): LongVideoAdAudienceRules {
  if (!isRecord(value)) {
    throw new Error(`${label} must be an object`);
  }

  for (const key of ["enabled", "preRollEnabled"] as const) {
    if (typeof value[key] !== "boolean") {
      throw new Error(`${label}.${key} must be boolean`);
    }
  }

  const integerFields = [
    ["firstMidrollSeconds", 30, 86400],
    ["repeatIntervalSeconds", 30, 86400],
    ["maxAdsPerVideo", 1, 50],
    ["minGapSeconds", 30, 86400],
  ] as const;

  for (const [key, min, max] of integerFields) {
    const n = value[key];
    if (!Number.isInteger(n) || Number(n) < min || Number(n) > max) {
      throw new Error(`${label}.${key} is out of range`);
    }
  }

  const breaks = value.customBreaksSeconds;
  if (
    !Array.isArray(breaks) ||
    breaks.length > 50 ||
    breaks.some(
      (item) =>
        !Number.isInteger(item) ||
        Number(item) < 30 ||
        Number(item) > 86400,
    )
  ) {
    throw new Error(`${label}.customBreaksSeconds is invalid`);
  }

  const normalizedBreaks = [...new Set(breaks as number[])].sort(
    (a, b) => a - b,
  );

  return {
    enabled: value.enabled === true,
    preRollEnabled: value.preRollEnabled === true,
    firstMidrollSeconds: Number(value.firstMidrollSeconds),
    repeatIntervalSeconds: Number(value.repeatIntervalSeconds),
    customBreaksSeconds: normalizedBreaks,
    maxAdsPerVideo: Number(value.maxAdsPerVideo),
    minGapSeconds: Number(value.minGapSeconds),
  };
}

export function validateVideoAdsRules(value: unknown): VideoAdsRules {
  if (!isRecord(value)) {
    throw new Error("Invalid video ads rules");
  }

  if (typeof value.masterEnabled !== "boolean") {
    throw new Error("videoAds.masterEnabled must be boolean");
  }
  if (typeof value.enabled !== "boolean") {
    throw new Error("videoAds.enabled must be boolean");
  }

  for (const [key, min, max] of [
    ["firstAdAfterVideos", 5, 1000],
    ["repeatEveryVideos", 1, 1000],
    ["autoDismissSeconds", 1, 60],
  ] as const) {
    const n = value[key];
    if (!Number.isInteger(n) || Number(n) < min || Number(n) > max) {
      throw new Error(`videoAds.${key} is out of range`);
    }
  }

  const longVideo = value.longVideoAds;
  if (!isRecord(longVideo) || typeof longVideo.enabled !== "boolean") {
    throw new Error("videoAds.longVideoAds is invalid");
  }

  return {
    masterEnabled: value.masterEnabled,
    enabled: value.enabled,
    firstAdAfterVideos: Number(value.firstAdAfterVideos),
    repeatEveryVideos: Number(value.repeatEveryVideos),
    autoDismissSeconds: Number(value.autoDismissSeconds),
    longVideoAds: {
      enabled: longVideo.enabled,
      free: validateAudienceRules(longVideo.free, "longVideoAds.free"),
      paid: validateAudienceRules(longVideo.paid, "longVideoAds.paid"),
    },
  };
}
