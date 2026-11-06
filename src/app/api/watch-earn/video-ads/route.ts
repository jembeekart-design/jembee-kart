import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";
import { DEFAULT_BUSINESS_RULES } from "@/firestore/businessRules/defaults";
import { validateVideoAdsRules } from "@/firestore/businessRules/validator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeHttpsUrl(value: unknown): string {
  if (typeof value !== "string") return "";

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function isWithinSchedule(data: FirebaseFirestore.DocumentData): boolean {
  const now = Date.now();

  if (typeof data.activeFrom === "string" && data.activeFrom.trim()) {
    const start = Date.parse(data.activeFrom);
    if (!Number.isFinite(start) || now < start) return false;
  }

  if (typeof data.activeTo === "string" && data.activeTo.trim()) {
    const end = Date.parse(data.activeTo);
    if (!Number.isFinite(end) || now > end) return false;
  }

  return true;
}

export async function GET() {
  try {
    const db = getAdminDb();

    const [rulesSnapshot, adsSnapshot] = await Promise.all([
      db.collection("business_rules").doc("videoAds").get(),
      db.collection("watchEarnFloatingAds")
        .where("enabled", "==", true)
        .limit(30)
        .get(),
    ]);

    const rawRules = {
      ...DEFAULT_BUSINESS_RULES.videoAds,
      ...(rulesSnapshot.data() || {}),
    };

    let rules = DEFAULT_BUSINESS_RULES.videoAds;

    try {
      rules = validateVideoAdsRules(rawRules);
    } catch {
      // Invalid stored settings fail closed.
      rules = DEFAULT_BUSINESS_RULES.videoAds;
    }

    if (!rules.enabled) {
      return NextResponse.json(
        { enabled: false, rules, ads: [] },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const ads = adsSnapshot.docs
      .map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          enabled: data.enabled === true,
          title: typeof data.title === "string" ? data.title.slice(0, 120) : "",
          imageUrl: safeHttpsUrl(data.imageUrl),
          actionUrl: safeHttpsUrl(data.actionUrl),
          position:
            data.position === "left" || data.position === "center"
              ? data.position
              : "right",
          priority:
            typeof data.priority === "number" && Number.isFinite(data.priority)
              ? data.priority
              : 999,
          activeFrom: data.activeFrom,
          activeTo: data.activeTo,
        };
      })
      .filter((ad) => {
        const original = adsSnapshot.docs.find((doc) => doc.id === ad.id);
        if (!original) return false;

        const data = original.data();

        return (
          ad.enabled &&
          Boolean(ad.imageUrl) &&
          Boolean(ad.actionUrl) &&
          isWithinSchedule(data)
        );
      })
      .sort((a, b) => a.priority - b.priority)
      .map(({ activeFrom, activeTo, priority, ...publicAd }) => publicAd);

    return NextResponse.json(
      { enabled: true, rules, ads },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Video ads API failed:", error);

    return NextResponse.json(
      { enabled: false, rules: DEFAULT_BUSINESS_RULES.videoAds, ads: [] },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }
}
