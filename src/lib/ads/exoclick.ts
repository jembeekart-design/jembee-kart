/**
 * JEMBEE PLAY ExoClick VAST configuration.
 *
 * Ads remain disabled unless explicitly enabled through deployment
 * environment configuration after integration tests pass.
 */

export const EXOCLICK_ZONES = {
  longVideo: {
    id: "6089786",
    vastUrl: "https://s.magsrv.com/v1/vast.php?id=6089786",
    format: "long-video",
  },
  shorts: {
    id: "6089790",
    vastUrl: "https://s.magsrv.com/v1/vast.php?idzone=6089790",
    format: "vertical-video",
  },
  recommendation: {
    id: "6089796",
    format: "recommendation",
  },
} as const;

export function isExoClickVideoAdsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_EXOCLICK_VIDEO_ADS_ENABLED === "true";
}

export function getExoClickLongVideoVastUrl(): string | null {
  if (!isExoClickVideoAdsEnabled()) return null;
  return EXOCLICK_ZONES.longVideo.vastUrl;
}

export function getExoClickShortsVastUrl(): string | null {
  if (!isExoClickVideoAdsEnabled()) return null;
  return EXOCLICK_ZONES.shorts.vastUrl;
}
