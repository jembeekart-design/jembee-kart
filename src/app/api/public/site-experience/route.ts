import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_SITE_EXPERIENCE = {
  siteName: "JEMBEE PLAY",
  tagline: "Watch • Learn • Create • Share",
  heroTitle: "अपनी किताब का हर सवाल सीखें",
  heroSubtitle: "अपनी class, book और chapter चुनें और सही video answer खोजें।",
  primaryColor: "#22d3ee",
  accentColor: "#8b5cf6",
  pageColor: "#090d16",
  surfaceColor: "#111827",
  announcementEnabled: false,
  announcementText: "",
  showLearningBanner: true,
  showShorts: true,
  showLongVideos: true,
  showHomeAds: true,
  compactCards: false,
};

function safeText(value: unknown, fallback: string, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : fallback;
}

function safeColor(value: unknown, fallback: string) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

function safeBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

export async function GET() {
  try {
    const snapshot = await getAdminDb().collection("admin_settings").doc("site_experience").get();
    const stored = snapshot.exists ? snapshot.data() ?? {} : {};

    const experience = {
      siteName: safeText(stored.siteName, DEFAULT_SITE_EXPERIENCE.siteName, 40),
      tagline: safeText(stored.tagline, DEFAULT_SITE_EXPERIENCE.tagline, 80),
      heroTitle: safeText(stored.heroTitle, DEFAULT_SITE_EXPERIENCE.heroTitle, 100),
      heroSubtitle: safeText(stored.heroSubtitle, DEFAULT_SITE_EXPERIENCE.heroSubtitle, 220),
      primaryColor: safeColor(stored.primaryColor, DEFAULT_SITE_EXPERIENCE.primaryColor),
      accentColor: safeColor(stored.accentColor, DEFAULT_SITE_EXPERIENCE.accentColor),
      pageColor: safeColor(stored.pageColor, DEFAULT_SITE_EXPERIENCE.pageColor),
      surfaceColor: safeColor(stored.surfaceColor, DEFAULT_SITE_EXPERIENCE.surfaceColor),
      announcementEnabled: safeBoolean(stored.announcementEnabled, false),
      announcementText: safeText(stored.announcementText, "", 180),
      showLearningBanner: safeBoolean(stored.showLearningBanner, true),
      showShorts: safeBoolean(stored.showShorts, true),
      showLongVideos: safeBoolean(stored.showLongVideos, true),
      showHomeAds: safeBoolean(stored.showHomeAds, true),
      compactCards: safeBoolean(stored.compactCards, false),\n      sectionOrder: safeSectionOrder(stored.sectionOrder),
    };

    return NextResponse.json(experience, {
      headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=120" },
    });
  } catch {
    return NextResponse.json(DEFAULT_SITE_EXPERIENCE, {
      headers: { "Cache-Control": "no-store" },
    });
  }
}
