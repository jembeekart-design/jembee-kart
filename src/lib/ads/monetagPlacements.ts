/**
 * Exact, first-party locations where an administrator may place a Monetag
 * Direct Link card. Auto-placement formats (MultiTag, OnClick, Vignette and
 * In-Page Push) are intentionally not loaded by this application.
 */
export const MONETAG_PLACEMENTS = [
  {
    id: "home-after-learning-banner",
    label: "Home · after the learning banner",
    route: "/",
  },
  {
    id: "home-after-shorts",
    label: "Home · between Shorts and Long Videos",
    route: "/",
  },
  {
    id: "home-after-video-grid",
    label: "Home · after the video grid",
    route: "/",
  },
  {
    id: "explore-bottom",
    label: "Explore · below categories and featured links",
    route: "/explore",
  },
  {
    id: "videos-after-feed",
    label: "Videos · below the video library",
    route: "/videos",
  },
] as const;

export type MonetagPlacementId = (typeof MONETAG_PLACEMENTS)[number]["id"];

export function isMonetagPlacementId(value: unknown): value is MonetagPlacementId {
  return typeof value === "string" && MONETAG_PLACEMENTS.some((placement) => placement.id === value);
}

/**
 * Monetag Direct Links can be attached to a user-initiated link/button. Only
 * HTTPS links are accepted so an admin cannot inject javascript:, data:, or
 * mixed-content destinations into a public page.
 */
/** Optional admin-provided creative artwork; never accepts non-HTTPS sources. */
export function normalizeMonetagCreativeUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const input = value.trim();
  if (!input || input.length > 2048) return null;
  try {
    const url = new URL(input);
    if (url.protocol !== "https:" || !url.hostname || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function normalizeMonetagDirectLink(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const input = value.trim();
  if (!input || input.length > 2048) return null;

  try {
    const url = new URL(input.startsWith("//") ? `https:${input}` : input);
    if (url.protocol !== "https:" || !url.hostname || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}
