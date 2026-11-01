import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";

const DEFAULT_SETTINGS = {
  rewardsEnabled: true,
  dailyRewards: true,
  referralRewards: true,
  cashbackRewards: true,
  vipRewards: false,
  signupReward: "100",
  dailyRewardPoints: "10",
  referralRewardPoints: "50",
  vipMinimumPoints: "1000",
};

async function verifyAdmin(req: Request): Promise<string> {
  const header = req.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const token = header.slice(7).trim();
  if (!token || token.length > 8192) throw new Error("UNAUTHORIZED");
  const decoded = await getAdminAuth().verifyIdToken(token, true);
  const db = getAdminDb();
  const direct = await db.collection("users").doc(decoded.uid).get();
  let user = direct.exists ? direct.data() : undefined;
  if (user?.role !== "admin" && user?.role !== "super_admin") {
    const fallback = await db.collection("users").where("uid", "==", decoded.uid).limit(1).get();
    user = fallback.docs[0]?.data();
  }
  if (user?.role !== "admin" && user?.role !== "super_admin") throw new Error("FORBIDDEN");
  return decoded.uid;
}

function errorResponse(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500;
  if (status === 500) console.error("Admin rewards settings API failed", error);
  return NextResponse.json(
    { success: false, message: status === 401 ? "Authentication required" : status === 403 ? "Admin access required" : "Rewards settings could not be processed" },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(req: Request) {
  try {
    await verifyAdmin(req);
    const snapshot = await getAdminDb().collection("admin_settings").doc("rewards").get();
    const stored = snapshot.exists ? snapshot.data() || {} : {};
    const settings = { ...DEFAULT_SETTINGS };
    for (const key of Object.keys(DEFAULT_SETTINGS) as Array<keyof typeof DEFAULT_SETTINGS>) {
      const value = stored[key];
      if (key.endsWith("Enabled") || key === "dailyRewards" || key === "referralRewards" || key === "cashbackRewards" || key === "vipRewards") {
        if (typeof value === "boolean") Object.assign(settings, { [key]: value });
      } else if (typeof value === "string" || typeof value === "number") {
        Object.assign(settings, { [key]: String(value) });
      }
    }
    return NextResponse.json({ success: true, settings }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}

export async function PUT(req: Request) {
  try {
    const uid = await verifyAdmin(req);
    const declaredLength = Number(req.headers.get("content-length") || 0);
    if (declaredLength > 4096) return NextResponse.json({ success: false, message: "Request body too large" }, { status: 413 });
    const raw = await req.text();
    if (Buffer.byteLength(raw, "utf8") > 4096) return NextResponse.json({ success: false, message: "Request body too large" }, { status: 413 });
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch { return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 }); }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return NextResponse.json({ success: false, message: "Invalid settings payload" }, { status: 400 });
    const input = parsed as Record<string, unknown>;
    const allowed = new Set(Object.keys(DEFAULT_SETTINGS));
    if (Object.keys(input).some((key) => !allowed.has(key))) return NextResponse.json({ success: false, message: "Unknown rewards setting" }, { status: 400 });

    const settings: typeof DEFAULT_SETTINGS = { ...DEFAULT_SETTINGS };
    for (const key of ["rewardsEnabled", "dailyRewards", "referralRewards", "cashbackRewards", "vipRewards"] as const) {
      if (typeof input[key] !== "boolean") return NextResponse.json({ success: false, message: `Invalid ${key}` }, { status: 400 });
      settings[key] = input[key];
    }
    for (const key of ["signupReward", "dailyRewardPoints", "referralRewardPoints", "vipMinimumPoints"] as const) {
      const rawValue = input[key];
      const value = typeof rawValue === "number" ? String(rawValue) : typeof rawValue === "string" ? rawValue.trim() : "";
      if (!/^\d+(?:\.\d{1,2})?$/.test(value)) return NextResponse.json({ success: false, message: `Invalid ${key}` }, { status: 400 });
      const numeric = Number(value);
      const max = key === "dailyRewardPoints" ? 100 : 100000;
      if (!Number.isFinite(numeric) || numeric < 0 || numeric > max || (key === "dailyRewardPoints" && numeric === 0)) {
        return NextResponse.json({ success: false, message: `${key} is outside the allowed range` }, { status: 400 });
      }
      settings[key] = value;
    }

    await getAdminDb().collection("admin_settings").doc("rewards").set({
      ...settings,
      updatedAt: new Date(),
      updatedBy: uid,
    }, { merge: true });
    return NextResponse.json({ success: true, settings, message: "Rewards settings saved" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}
