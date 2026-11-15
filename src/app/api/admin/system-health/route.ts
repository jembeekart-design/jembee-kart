import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function verifyAdmin(request: Request) {
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const decoded = await getAdminAuth().verifyIdToken(header.slice(7).trim(), true);
  const db = getAdminDb();
  const direct = await db.collection("users").doc(decoded.uid).get();
  let role = direct.data()?.role;
  if (role !== "admin" && role !== "super_admin") {
    const fallback = await db.collection("users").where("uid", "==", decoded.uid).limit(1).get();
    role = fallback.docs[0]?.data()?.role;
  }
  if (role !== "admin" && role !== "super_admin") throw new Error("FORBIDDEN");
}

export async function GET(request: Request) {
  try {
    await verifyAdmin(request);
    const started = Date.now();
    const db = getAdminDb();
    await db.collection("app_remote_config").doc("current").get();
    const firestoreLatencyMs = Date.now() - started;
    const checks = [
      { id: "admin_api", label: "Admin API", status: "healthy" as const },
      { id: "firestore", label: "Firestore", status: "healthy" as const, latencyMs: firestoreLatencyMs },
      { id: "firebase_admin_credentials", label: "Firebase Admin credentials", status: "healthy" as const },
      { id: "cashfree_config", label: "Cashfree configuration", status: process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY ? "configured" as const : "not_configured" as const },
      { id: "monetag_config", label: "Monetag configuration", status: process.env.MONETAG_API_TOKEN ? "configured" as const : "not_configured" as const },
      { id: "android_mobile_apk", label: "Android Mobile APK URL", status: process.env.NEXT_PUBLIC_JEMBEE_ANDROID_MOBILE_APK_URL ? "configured" as const : "not_configured" as const },
      { id: "android_tv_apk", label: "Android TV APK URL", status: process.env.NEXT_PUBLIC_JEMBEE_ANDROID_TV_APK_URL ? "configured" as const : "not_configured" as const },
    ];
    return NextResponse.json({ success: true, checkedAt: new Date().toISOString(), checks }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 503;
    return NextResponse.json({ success: false, error: status === 401 ? "UNAUTHORIZED" : status === 403 ? "FORBIDDEN" : "HEALTH_CHECK_FAILED" }, {
      status,
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  }
}
