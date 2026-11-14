import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";
import { verifyMonetagAdmin } from "@/lib/server/monetagAdminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await verifyMonetagAdmin(request);
    const db = getAdminDb();
    const [events, slots, settings] = await Promise.all([
      db.collection("ad_diagnostics").orderBy("createdAt", "desc").limit(100).get(),
      db.collection("adSlots").limit(100).get(),
      db.collection("business_rules").doc("videoAds").get(),
    ]);
    const activeMonetagSlots = slots.docs.filter((doc) => {
      const data = doc.data();
      return data.enabled === true && data.networkId === "monetag-direct-link" && data.format === "monetag-direct-link";
    }).length;
    const rules = settings.data() || {};
    return NextResponse.json({
      success: true,
      providerStatus: {
        masterEnabled: rules.masterEnabled === true,
        exoclickEnvironmentEnabled: process.env.NEXT_PUBLIC_EXOCLICK_VIDEO_ADS_ENABLED === "true",
        activeMonetagSlots,
      },
      events: events.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt;
        return {
          id: doc.id,
          event: data.event,
          provider: data.provider,
          placement: data.placement,
          environment: data.environment,
          billable: false,
          createdAt: createdAt && typeof createdAt.toDate === "function" ? createdAt.toDate().toISOString() : null,
        };
      }),
    }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, message: status === 401 ? "कृपया Admin login करें।" : status === 403 ? "केवल Admin यह logs देख सकता है।" : "Ad diagnostics उपलब्ध नहीं हैं।" }, { status });
  }
}
