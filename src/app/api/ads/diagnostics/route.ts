import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";
import { readBoundedJson } from "@/lib/server/readBoundedJson";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EVENTS = new Set([
  "vast_request", "ad_started", "ad_completed", "ad_no_fill", "ad_error",
  "ad_timeout", "sdk_error", "placement_loaded", "placement_click", "placement_error",
]);
const PROVIDERS = new Set(["exoclick", "monetag", "ima", "system"]);
const PLACEMENTS = new Set([
  "long-video", "shorts", "home-after-learning-banner", "home-after-shorts",
  "home-after-video-grid", "explore-bottom", "videos-after-feed", "learning-bottom",
]);

function requestFingerprint(request: Request): string {
  const forwarded = request.headers.get("x-vercel-forwarded-for")
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
  const secret = process.env.AD_DIAGNOSTIC_HASH_SECRET || process.env.FIREBASE_PROJECT_ID || "jembee-play-diagnostic";
  return createHash("sha256").update(`${secret}:${forwarded}`).digest("hex").slice(0, 32);
}

export async function POST(request: Request) {
  const parsed = await readBoundedJson(request, 1024);
  if (!parsed.ok) return NextResponse.json({ success: false }, { status: parsed.status });
  const body = parsed.value as Record<string, unknown>;
  if (!body || typeof body !== "object" || Array.isArray(body)
    || typeof body.event !== "string" || !EVENTS.has(body.event)
    || typeof body.provider !== "string" || !PROVIDERS.has(body.provider)
    || typeof body.placement !== "string" || !PLACEMENTS.has(body.placement)) {
    return NextResponse.json({ success: false, code: "INVALID_DIAGNOSTIC" }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const now = new Date();
    const minute = Math.floor(now.getTime() / 60_000);
    const fingerprint = requestFingerprint(request);
    const rateRef = db.collection("ad_diagnostic_rate_limits").doc(`${fingerprint}_${minute}`);
    const eventRef = db.collection("ad_diagnostics").doc();
    await db.runTransaction(async (transaction) => {
      const rateSnap = await transaction.get(rateRef);
      const count = Number(rateSnap.data()?.count || 0);
      if (count >= 30) throw new Error("RATE_LIMITED");
      transaction.set(rateRef, { count: count + 1, expiresAt: new Date(now.getTime() + 2 * 60 * 60 * 1000) }, { merge: true });
      transaction.create(eventRef, {
        event: body.event,
        provider: body.provider,
        placement: body.placement,
        environment: process.env.VERCEL_ENV === "production" ? "production" : "preview",
        createdAt: now,
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        billable: false,
      });
    });
    return NextResponse.json({ success: true }, { status: 202, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return NextResponse.json({ success: false, code: "RATE_LIMITED" }, { status: 429 });
    }
    console.error("Ad diagnostic write failed: AD_DIAGNOSTIC_WRITE_FAILED");
    return NextResponse.json({ success: false }, { status: 503 });
  }
}
