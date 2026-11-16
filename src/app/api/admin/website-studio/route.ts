import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CURRENT_PATH = ["admin_settings", "site_experience"] as const;
const MAX_BODY_BYTES = 32 * 1024;
const TEXT_LIMITS: Record<string, number> = {
  siteName: 40, tagline: 80, heroTitle: 100, heroSubtitle: 220, announcementText: 180,
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function safeText(value: unknown, max: number) {
  return typeof value === "string" && value.length <= max && !/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value);
}
async function requireAdmin(request: Request) {
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
  return decoded.uid;
}
function validateConfig(value: unknown): Record<string, unknown> {
  if (!isObject(value)) throw new Error("INVALID_CONFIG");
  const allowed = new Set([
    ...Object.keys(TEXT_LIMITS), "primaryColor", "accentColor", "pageColor", "surfaceColor",
    "announcementEnabled", "showLearningBanner", "showShorts", "showLongVideos", "showHomeAds",
    "compactCards", "sectionOrder", "homeCategories", "navigationLabels", "featuredCreators",
    "featuredPlaylists", "featuredVideos", "schemaVersion",
  ]);
  if (Object.keys(value).some((key) => !allowed.has(key))) throw new Error("UNKNOWN_CONFIG_KEY");
  for (const [key, max] of Object.entries(TEXT_LIMITS)) if (!safeText(value[key], max)) throw new Error("INVALID_TEXT");
  for (const key of ["primaryColor", "accentColor", "pageColor", "surfaceColor"]) {
    if (typeof value[key] !== "string" || !/^#[0-9a-fA-F]{6}$/.test(value[key] as string)) throw new Error("INVALID_COLOR");
  }
  for (const key of ["announcementEnabled", "showLearningBanner", "showShorts", "showLongVideos", "showHomeAds", "compactCards"]) {
    if (typeof value[key] !== "boolean") throw new Error("INVALID_TOGGLE");
  }
  if (!Array.isArray(value.sectionOrder) || value.sectionOrder.length !== 3 ||
      new Set(value.sectionOrder).size !== 3 ||
      value.sectionOrder.some((key) => !["learning", "shorts", "longVideos"].includes(String(key)))) throw new Error("INVALID_SECTION_ORDER");
  if (!Array.isArray(value.homeCategories) || value.homeCategories.length > 12 ||
      value.homeCategories.some((item) => !isObject(item) || !safeText(item.id, 64) || !safeText(item.label, 24) || !safeText(item.filter, 40) || typeof item.enabled !== "boolean")) throw new Error("INVALID_CATEGORIES");
  const navKeys = ["home", "shorts", "explore", "learning", "history", "liked"];
  if (!isObject(value.navigationLabels) || Object.keys(value.navigationLabels).some((key) => !navKeys.includes(key)) ||
      navKeys.some((key) => !safeText(value.navigationLabels && (value.navigationLabels as Record<string, unknown>)[key], 32))) throw new Error("INVALID_NAVIGATION");
  if (!Array.isArray(value.featuredCreators) || value.featuredCreators.length > 8 ||
      value.featuredCreators.some((item) => !isObject(item) || !safeText(item.creatorId, 128) || !safeText(item.label, 48) || typeof item.enabled !== "boolean")) throw new Error("INVALID_CREATORS");
  if (!Array.isArray(value.featuredPlaylists) || value.featuredPlaylists.length > 8 ||
      value.featuredPlaylists.some((item) => !isObject(item) || !safeText(item.id, 64) || !safeText(item.title, 60) || !safeText(item.description, 120) || !Array.isArray(item.videoIds) || item.videoIds.length > 12 || item.videoIds.some((id) => !safeText(id, 128)) || typeof item.enabled !== "boolean")) throw new Error("INVALID_PLAYLISTS");
  if (!Array.isArray(value.featuredVideos) || value.featuredVideos.length > 12 ||
      value.featuredVideos.some((item) => {
        if (!isObject(item) || !safeText(item.videoId, 128) || !safeText(item.label, 60) || typeof item.enabled !== "boolean") return true;
        const start = item.startsAt === "" || (typeof item.startsAt === "string" && Number.isFinite(Date.parse(item.startsAt)));
        const end = item.endsAt === "" || (typeof item.endsAt === "string" && Number.isFinite(Date.parse(item.endsAt)));
        return !start || !end || (item.startsAt !== "" && item.endsAt !== "" && Date.parse(String(item.endsAt)) <= Date.parse(String(item.startsAt)));
      })) throw new Error("INVALID_FEATURED_VIDEOS");
  return { ...value, schemaVersion: 1 };
}
function failure(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 :
    code.startsWith("INVALID_") || code === "UNKNOWN_CONFIG_KEY" ? 400 : 500;
  return NextResponse.json({ success: false, error: status === 401 ? "UNAUTHORIZED" : status === 403 ? "FORBIDDEN" : status === 400 ? code : "WEBSITE_STUDIO_UNAVAILABLE" }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const db = getAdminDb();
    const current = await db.doc(CURRENT_PATH.join("/")).get();
    const history = await db.collection(CURRENT_PATH.join("/") + "/versions").orderBy("version", "desc").limit(10).get();
    return NextResponse.json({
      success: true,
      currentVersion: Number(current.data()?.configVersion) || 1,
      versions: history.docs.map((item) => ({
        version: Number(item.data().version) || 1,
        createdAt: item.data().createdAt?.toDate?.()?.toISOString?.() || null,
        actorUid: typeof item.data().actorUid === "string" ? item.data().actorUid : "",
      })),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return failure(error); }
}

export async function POST(request: Request) {
  try {
    const uid = await requireAdmin(request);
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return NextResponse.json({ success: false, error: "BODY_TOO_LARGE" }, { status: 413 });
    let body: unknown;
    try { body = JSON.parse(raw); } catch { return NextResponse.json({ success: false, error: "INVALID_JSON" }, { status: 400 }); }
    if (!isObject(body) || !Number.isSafeInteger(body.expectedVersion) || typeof body.action !== "string") return NextResponse.json({ success: false, error: "INVALID_REQUEST" }, { status: 400 });

    const db = getAdminDb();
    const currentRef = db.doc(CURRENT_PATH.join("/"));
    const auditRef = db.collection("adminActivityLogs").doc();
    const result = await db.runTransaction(async (tx) => {
      const currentSnap = await tx.get(currentRef);
      const currentData = currentSnap.exists ? currentSnap.data() || {} : {};
      const currentVersion = Number(currentData.configVersion) || 1;
      if (currentVersion !== body.expectedVersion) return { conflict: true, currentVersion };
      const versionRef = db.collection(CURRENT_PATH.join("/") + "/versions").doc(String(currentVersion));
      if (body.action === "save") {
        const nextConfig = validateConfig(body.config);
        const existingVersion = await tx.get(versionRef);
        if (!existingVersion.exists) tx.create(versionRef, { version: currentVersion, config: currentData, actorUid: uid, createdAt: FieldValue.serverTimestamp() });
        const nextVersion = currentVersion + 1;
        tx.set(currentRef, { ...nextConfig, configVersion: nextVersion, updatedAt: FieldValue.serverTimestamp(), updatedBy: uid });
        tx.create(auditRef, { actorUid: uid, action: "website_studio_save", target: "site_experience", fromVersion: currentVersion, toVersion: nextVersion, createdAt: FieldValue.serverTimestamp() });
        return { conflict: false, currentVersion: nextVersion };
      }
      if (body.action === "restore") {
        if (!Number.isSafeInteger(body.targetVersion) || Number(body.targetVersion) < 1 || Number(body.targetVersion) >= currentVersion) throw new Error("INVALID_TARGET_VERSION");
        const targetRef = db.collection(CURRENT_PATH.join("/") + "/versions").doc(String(body.targetVersion));
        const targetSnap = await tx.get(targetRef);
        if (!targetSnap.exists || !isObject(targetSnap.data()?.config)) throw new Error("VERSION_NOT_FOUND");
        const restored = validateConfig(targetSnap.data()?.config);
        const nextVersion = currentVersion + 1;
        tx.set(currentRef, { ...restored, configVersion: nextVersion, updatedAt: FieldValue.serverTimestamp(), updatedBy: uid });
        tx.create(auditRef, { actorUid: uid, action: "website_studio_restore", target: "site_experience", fromVersion: currentVersion, restoredVersion: Number(body.targetVersion), toVersion: nextVersion, createdAt: FieldValue.serverTimestamp() });
        return { conflict: false, currentVersion: nextVersion };
      }
      throw new Error("INVALID_ACTION");
    });
    if (result.conflict) return NextResponse.json({ success: false, error: "VERSION_CONFLICT", currentVersion: result.currentVersion }, { status: 409 });
    return NextResponse.json({ success: true, currentVersion: result.currentVersion }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Error && ["INVALID_TARGET_VERSION", "VERSION_NOT_FOUND", "INVALID_ACTION"].includes(error.message)) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return failure(error);
  }
}
