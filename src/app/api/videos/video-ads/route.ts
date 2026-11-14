import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";
import {
  DEFAULT_VIDEO_ADS_RULES,
  validateVideoAdsRules,
} from "@/lib/ads/videoAdsRules";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function disabledResponse() {
  return NextResponse.json(
    {
      enabled: false,
      rules: {
        enabled: false,
        firstAdAfterVideos: 0,
        repeatEveryVideos: 0,
        autoDismissSeconds: 0,
      },
      masterEnabled: false,
      providerReady: false,
      longVideoAds: DEFAULT_VIDEO_ADS_RULES.longVideoAds,
      ads: [],
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

export async function GET() {
  try {
    const snap = await getAdminDb()
      .collection("business_rules")
      .doc("videoAds")
      .get();

    const stored = snap.data() || {};
    const storedLongVideoAds = isRecord(stored.longVideoAds)
      ? stored.longVideoAds
      : {};
    const storedFree = isRecord(storedLongVideoAds.free)
      ? storedLongVideoAds.free
      : {};
    const storedPaid = isRecord(storedLongVideoAds.paid)
      ? storedLongVideoAds.paid
      : {};

    const rules = validateVideoAdsRules({
      ...DEFAULT_VIDEO_ADS_RULES,
      ...stored,
      longVideoAds: {
        ...DEFAULT_VIDEO_ADS_RULES.longVideoAds,
        ...storedLongVideoAds,
        free: {
          ...DEFAULT_VIDEO_ADS_RULES.longVideoAds.free,
          ...storedFree,
        },
        paid: {
          ...DEFAULT_VIDEO_ADS_RULES.longVideoAds.paid,
          ...storedPaid,
        },
      },
    });

    return NextResponse.json(
      {
        // Legacy Shorts timed campaigns remain disabled. Long-video schedules
        // are public configuration only; the player also requires the explicit
        // deployment feature flag before requesting ExoClick VAST.
        enabled: false,
        rules: {
          enabled: false,
          firstAdAfterVideos: 0,
          repeatEveryVideos: 0,
          autoDismissSeconds: 0,
        },
        masterEnabled: rules.masterEnabled,
        providerReady: process.env.NEXT_PUBLIC_EXOCLICK_VIDEO_ADS_ENABLED === "true",
        // Public schedule only; no provider credentials or secrets.
        longVideoAds: rules.longVideoAds,
        ads: [],
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch {
    return disabledResponse();
  }
}
