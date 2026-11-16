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
  sectionOrder: ["learning", "shorts", "longVideos"],
  homeCategories: [
    { id: "education", label: "Education", filter: "education", enabled: true },
    { id: "music", label: "Music", filter: "music", enabled: true },
    { id: "science", label: "Science", filter: "science", enabled: true },
    { id: "technology", label: "Technology", filter: "technology", enabled: true },
    { id: "gaming", label: "Gaming", filter: "gaming", enabled: true },
    { id: "travel", label: "Travel", filter: "travel", enabled: true },
  ],
  navigationLabels: { home: "Home", shorts: "Shorts", explore: "Explore", learning: "School Learning", history: "History", liked: "Liked videos" },
  featuredCreators: [],
  featuredPlaylists: [],
  featuredVideos: [],
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

function safeHomeCategories(value: unknown) {
  const fallback = DEFAULT_SITE_EXPERIENCE.homeCategories;
  if (!Array.isArray(value)) return fallback;
  return value.slice(0, 12).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const candidate = item as Record<string, unknown>;
    const id = safeText(candidate.id, "", 48).toLowerCase();
    const label = safeText(candidate.label, "", 24);
    const filter = safeText(candidate.filter, "", 40);
    if (!/^[a-z0-9][a-z0-9-]{0,47}$/.test(id) || !label || !filter || typeof candidate.enabled !== "boolean") return [];
    return [{ id, label, filter, enabled: candidate.enabled }];
  });
}

function safeNavigationLabels(value: unknown) {
  const fallback = DEFAULT_SITE_EXPERIENCE.navigationLabels;
  if (!value || typeof value !== "object") return fallback;
  const input = value as Record<string, unknown>;
  return Object.fromEntries(Object.entries(fallback).map(([key, label]) => [key, safeText(input[key], label, 32) || label]));
}

function safeFeaturedCreators(value: unknown) {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.slice(0, 8).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const candidate = item as Record<string, unknown>;
    const creatorId = safeText(candidate.creatorId, "", 128);
    const label = safeText(candidate.label, "", 48);
    if (!creatorId || !label || typeof candidate.enabled !== "boolean" || seen.has(creatorId)) return [];
    seen.add(creatorId);
    return [{ creatorId, label, enabled: candidate.enabled }];
  });
}

function safeFeaturedPlaylists(value: unknown) {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.slice(0, 8).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const candidate = item as Record<string, unknown>;
    const id = safeText(candidate.id, "", 48).toLowerCase();
    const title = safeText(candidate.title, "", 60);
    const description = safeText(candidate.description, "", 120);
    const videoIds = Array.isArray(candidate.videoIds)
      ? [...new Set(candidate.videoIds.filter((entry): entry is string => typeof entry === "string").map((entry) => entry.trim()).filter((entry) => entry.length > 0 && entry.length <= 128))].slice(0, 12)
      : [];
    if (!/^[a-z0-9][a-z0-9-]{0,47}$/.test(id) || !title || !videoIds.length || typeof candidate.enabled !== "boolean" || seen.has(id)) return [];
    seen.add(id);
    return [{ id, title, description, videoIds, enabled: candidate.enabled }];
  });
}

function safeFeaturedVideos(value: unknown) {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.slice(0, 12).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const candidate = item as Record<string, unknown>;
    const videoId = safeText(candidate.videoId, "", 128);
    const label = safeText(candidate.label, "", 60);
    const startsAt = candidate.startsAt === "" ? "" : typeof candidate.startsAt === "string" && Number.isFinite(Date.parse(candidate.startsAt)) ? new Date(candidate.startsAt).toISOString() : "";
    const endsAt = candidate.endsAt === "" ? "" : typeof candidate.endsAt === "string" && Number.isFinite(Date.parse(candidate.endsAt)) ? new Date(candidate.endsAt).toISOString() : "";
    if (!videoId || !label || typeof candidate.enabled !== "boolean" || seen.has(videoId)) return [];
    if ((candidate.startsAt !== "" && !startsAt) || (candidate.endsAt !== "" && !endsAt)) return [];
    if (startsAt && endsAt && Date.parse(endsAt) <= Date.parse(startsAt)) return [];
    seen.add(videoId);
    return [{ videoId, label, startsAt, endsAt, enabled: candidate.enabled }];
  });
}

function safeSectionOrder(value: unknown): string[] {
  const allowed = ["learning", "shorts", "longVideos"];
  const requested = Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && allowed.includes(item)) : [];
  return [...new Set(requested), ...allowed.filter((item) => !requested.includes(item))];
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
      compactCards: safeBoolean(stored.compactCards, false),
      sectionOrder: safeSectionOrder(stored.sectionOrder),
      homeCategories: safeHomeCategories(stored.homeCategories),
      navigationLabels: safeNavigationLabels(stored.navigationLabels),
      featuredCreators: safeFeaturedCreators(stored.featuredCreators),
      featuredPlaylists: safeFeaturedPlaylists(stored.featuredPlaylists),
      featuredVideos: safeFeaturedVideos(stored.featuredVideos),
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
