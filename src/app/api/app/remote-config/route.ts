import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULTS = {
  schemaVersion: 1,
  configVersion: 1,
  maintenance: { enabled: false, message: "" },
  minimumVersions: { mobile: "0.2.0", tv: "0.2.0" },
  latestVersions: { mobile: "0.2.0", tv: "0.2.0" },
  updateUrls: { mobile: "", tv: "" },
  features: {
    shorts: true,
    schoolLearning: true,
    creatorUploads: false,
    paidVideo: false,
    videoAds: false,
    notifications: false,
  },
  playback: { autoplay: true, preloadNextMetadata: true },
};

const FEATURE_KEYS = Object.keys(DEFAULTS.features) as Array<keyof typeof DEFAULTS.features>;
const VERSION = /^\d{1,4}\.\d{1,4}\.\d{1,4}$/;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function validText(value: unknown, max: number): value is string {
  return typeof value === "string" && value.length <= max && !/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value);
}
function publicConfig(data: Record<string, unknown>) {
  const maintenance = isObject(data.maintenance) ? data.maintenance : {};
  const minimum = isObject(data.minimumVersions) ? data.minimumVersions : {};
  const latest = isObject(data.latestVersions) ? data.latestVersions : {};
  const urls = isObject(data.updateUrls) ? data.updateUrls : {};
  const features = isObject(data.features) ? data.features : {};
  const playback = isObject(data.playback) ? data.playback : {};
  const safeUrl = (value: unknown) => {
    if (typeof value !== "string" || value.length > 500) return "";
    try { const url = new URL(value); return url.protocol === "https:" ? url.toString() : ""; } catch { return ""; }
  };
  return {
    schemaVersion: 1,
    configVersion: Number.isSafeInteger(data.configVersion) && Number(data.configVersion) > 0 ? Number(data.configVersion) : 1,
    maintenance: { enabled: maintenance.enabled === true, message: validText(maintenance.message, 240) ? maintenance.message : "" },
    minimumVersions: {
      mobile: typeof minimum.mobile === "string" && VERSION.test(minimum.mobile) ? minimum.mobile : DEFAULTS.minimumVersions.mobile,
      tv: typeof minimum.tv === "string" && VERSION.test(minimum.tv) ? minimum.tv : DEFAULTS.minimumVersions.tv,
    },
    latestVersions: {
      mobile: typeof latest.mobile === "string" && VERSION.test(latest.mobile) ? latest.mobile : DEFAULTS.latestVersions.mobile,
      tv: typeof latest.tv === "string" && VERSION.test(latest.tv) ? latest.tv : DEFAULTS.latestVersions.tv,
    },
    updateUrls: { mobile: safeUrl(urls.mobile), tv: safeUrl(urls.tv) },
    features: Object.fromEntries(FEATURE_KEYS.map((key) => [key, typeof features[key] === "boolean" ? features[key] : DEFAULTS.features[key]])),
    playback: { autoplay: playback.autoplay !== false, preloadNextMetadata: playback.preloadNextMetadata !== false },
  };
}

async function adminUid(request: Request): Promise<string> {
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const decoded = await getAdminAuth().verifyIdToken(header.slice(7).trim(), true);
  const db = getAdminDb();
  const user = await db.collection("users").doc(decoded.uid).get();
  let role = user.data()?.role;
  if (role !== "admin" && role !== "super_admin") {
    const fallback = await db.collection("users").where("uid", "==", decoded.uid).limit(1).get();
    role = fallback.docs[0]?.data()?.role;
  }
  if (role !== "admin" && role !== "super_admin") throw new Error("FORBIDDEN");
  return decoded.uid;
}

function errorResponse(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500;
  return NextResponse.json({ success: false, error: status === 401 ? "UNAUTHORIZED" : status === 403 ? "FORBIDDEN" : "REMOTE_CONFIG_UNAVAILABLE" }, { status });
}

export async function GET() {
  try {
    const snap = await getAdminDb().collection("app_remote_config").doc("current").get();
    const config = publicConfig(snap.exists ? (snap.data() || {}) : DEFAULTS);
    return NextResponse.json({ success: true, config }, {
      headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=120", "ETag": `"${config.configVersion}"` },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const uid = await adminUid(request);
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 8192) return NextResponse.json({ success: false, error: "BODY_TOO_LARGE" }, { status: 413 });
    let body: unknown;
    try { body = JSON.parse(raw); } catch { return NextResponse.json({ success: false, error: "INVALID_JSON" }, { status: 400 }); }
    if (!isObject(body) || !Number.isSafeInteger(body.expectedConfigVersion) || !isObject(body.patch)) {
      return NextResponse.json({ success: false, error: "INVALID_REQUEST" }, { status: 400 });
    }
    const patch = body.patch;
    const allowedTop = ["maintenance", "minimumVersions", "latestVersions", "updateUrls", "features", "playback"];
    if (Object.keys(patch).some((key) => !allowedTop.includes(key))) return NextResponse.json({ success: false, error: "UNKNOWN_CONFIG_KEY" }, { status: 400 });

    const currentRef = getAdminDb().collection("app_remote_config").doc("current");
    const auditRef = getAdminDb().collection("app_remote_config_audit").doc();
    const result = await getAdminDb().runTransaction(async (tx) => {
      const snap = await tx.get(currentRef);
      const current = publicConfig(snap.exists ? (snap.data() || {}) : DEFAULTS);
      if (current.configVersion !== body.expectedConfigVersion) return { conflict: true, version: current.configVersion };
      const next: Record<string, unknown> = { ...current };
      for (const [section, value] of Object.entries(patch)) {
        if (!isObject(value)) throw new Error("INVALID_SECTION");
        const prior = next[section];
        if (!isObject(prior) || Object.keys(value).some((key) => !(key in prior))) throw new Error("UNKNOWN_SECTION_KEY");
        next[section] = { ...prior, ...value };
      }
      const validated = publicConfig({ ...next, configVersion: current.configVersion + 1 });
      // Validate incoming values rather than silently accepting malformed admin input.
      if (isObject(patch.maintenance) && (("enabled" in patch.maintenance && typeof patch.maintenance.enabled !== "boolean") || ("message" in patch.maintenance && !validText(patch.maintenance.message, 240)))) throw new Error("INVALID_MAINTENANCE");
      for (const section of ["minimumVersions", "latestVersions"] as const) if (isObject(patch[section]) && Object.values(patch[section]).some((v) => typeof v !== "string" || !VERSION.test(v))) throw new Error("INVALID_VERSION");
      if (isObject(patch.updateUrls) && Object.values(patch.updateUrls).some((v) => v !== "" && (typeof v !== "string" || !/^https:\/\//.test(v)))) throw new Error("INVALID_UPDATE_URL");
      if (isObject(patch.features) && Object.values(patch.features).some((v) => typeof v !== "boolean")) throw new Error("INVALID_FEATURE_FLAG");
      if (isObject(patch.playback) && Object.values(patch.playback).some((v) => typeof v !== "boolean")) throw new Error("INVALID_PLAYBACK_SETTING");
      tx.set(currentRef, { ...validated, updatedAt: FieldValue.serverTimestamp(), updatedBy: uid });
      tx.create(auditRef, { actorUid: uid, action: "remote_config_update", fromVersion: current.configVersion, toVersion: validated.configVersion, patch, createdAt: FieldValue.serverTimestamp() });
      return { conflict: false, config: validated };
    });
    if (result.conflict) return NextResponse.json({ success: false, error: "CONFIG_VERSION_CONFLICT", currentConfigVersion: result.version }, { status: 409 });
    return NextResponse.json({ success: true, config: result.config });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const validation = ["INVALID_SECTION", "UNKNOWN_SECTION_KEY", "INVALID_MAINTENANCE", "INVALID_VERSION", "INVALID_UPDATE_URL", "INVALID_FEATURE_FLAG", "INVALID_PLAYBACK_SETTING"].includes(code);
    if (validation) return NextResponse.json({ success: false, error: code }, { status: 400 });
    return errorResponse(error);
  }
}
