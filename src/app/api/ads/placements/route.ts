import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";
import {
  isMonetagPlacementId,
  normalizeMonetagDirectLink,
} from "@/lib/ads/monetagPlacements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Firestore Admin returns schemaless document data; keep dynamic fields unknown. */
type FirestoreAdSlot = { id: string; [field: string]: unknown };

function expectedEnvironment(): "test" | "production" {
  return process.env.VERCEL_ENV === "production" ? "production" : "test";
}

export async function GET(request: Request) {
  const placement = new URL(request.url).searchParams.get("placement");
  if (!isMonetagPlacementId(placement)) {
    return NextResponse.json(
      { success: false, slot: null, message: "Unknown ad placement." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const snapshot = await getAdminDb()
      .collection(FIRESTORE_PATHS.AD_MANAGEMENT.SLOTS)
      .limit(100)
      .get();

    const environment = expectedEnvironment();
    const candidates = snapshot.docs
      .map((item) => ({ ...item.data(), id: item.id }) as FirestoreAdSlot)
      .filter((item) => {
        return item.enabled === true
          && item.networkId === "monetag-direct-link"
          && item.format === "monetag-direct-link"
          && item.placement === placement
          && item.environment === environment;
      })
      .map((item) => ({
        id: item.id,
        name: typeof item.name === "string" ? item.name.slice(0, 80) : "Sponsored offer",
        title: typeof item.title === "string" ? item.title.slice(0, 120) : "Sponsored offer",
        description: typeof item.description === "string" ? item.description.slice(0, 240) : "Open this offer from our advertising partner.",
        ctaLabel: typeof item.ctaLabel === "string" ? item.ctaLabel.slice(0, 32) : "View offer",
        url: normalizeMonetagDirectLink(item.adUnitId),
        priority: typeof item.priority === "number" && Number.isFinite(item.priority) ? item.priority : 0,
      }))
      .filter((item) => item.url)
      .sort((a, b) => b.priority - a.priority);

    const slot = candidates[0] || null;
    return NextResponse.json(
      { success: true, placement, slot: slot ? {
        id: slot.id,
        name: slot.name,
        title: slot.title,
        description: slot.description,
        ctaLabel: slot.ctaLabel,
        url: slot.url,
      } : null },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch {
    // Do not write Firestore/provider error objects into public logs.
    console.error("Monetag placement lookup failed: AD_PLACEMENT_LOOKUP_FAILED");
    return NextResponse.json(
      { success: false, slot: null },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
