import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/firebase/admin";
import { requireAdmin, isAdminIdentity } from "@/lib/server/requireAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VERSION = /^\d{1,4}\.\d{1,4}\.\d{1,4}$/;
const MAX_APK_BYTES = 250 * 1024 * 1024;
const CURRENT_APP_VERSION_CODE = 2;
const CURRENT_APP_VERSION_NAME = "0.2.0";
const OWNER = "jembeekart-design";
const REPO = "jembee-kart";
const PACKAGES = { mobile: "in.jembeeplay.mobile", tv: "in.jembeeplay.tv" } as const;
const UPDATE_PAGE = { mobile: "https://jembeeplay.in/download#android-mobile", tv: "https://jembeeplay.in/download#android-tv" } as const;

function compareVersions(left: string, right: string): number {
  const a = left.split(".").map(Number), b = right.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
  return 0;
}
function reply(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const identity = await requireAdmin(request);
  if (!isAdminIdentity(identity)) return identity;
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > 16 * 1024) return reply("Request too large", 413);
    let body: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return reply("Invalid request body", 400);
      body = parsed as Record<string, unknown>;
    } catch { return reply("Invalid JSON", 400); }

    const platform = body.platform;
    if (platform !== "mobile" && platform !== "tv") return reply("Invalid platform", 400);
    const versionName = typeof body.versionName === "string" ? body.versionName.trim() : "";
    const versionCode = body.versionCode;
    const minimumVersionName = typeof body.minimumVersionName === "string" ? body.minimumVersionName.trim() : "";
    const releaseNotes = typeof body.releaseNotes === "string" ? body.releaseNotes.trim().slice(0, 2000) : "";
    const tag = typeof body.releaseTag === "string" ? body.releaseTag.trim() : "";
    const assetName = typeof body.assetName === "string" ? body.assetName.trim() : "";
    const expectedAsset = "jembee-play-" + platform + "-" + versionName + ".apk";
    if (!VERSION.test(versionName) || !VERSION.test(minimumVersionName) ||
        !Number.isSafeInteger(versionCode) || Number(versionCode) < 1 ||
        !/^v?[A-Za-z0-9._-]{1,80}$/.test(tag) || assetName !== expectedAsset) {
      return reply("Invalid release metadata or APK asset name", 400);
    }

    const githubResponse = await fetch("https://api.github.com/repos/" + OWNER + "/" + REPO + "/releases/tags/" + encodeURIComponent(tag), {
      headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "JembeePlay-ReleaseManager" },
      cache: "no-store",
    });
    if (!githubResponse.ok) return reply(githubResponse.status === 404 ? "GitHub Release tag not found. Publish the APK asset first." : "GitHub Release verification unavailable", githubResponse.status === 404 ? 404 : 503);
    const ghRelease = await githubResponse.json() as { draft?: boolean; prerelease?: boolean; assets?: Array<{ name?: string; size?: number; digest?: string | null; browser_download_url?: string; content_type?: string }> };
    if (ghRelease.draft || ghRelease.prerelease) return reply("Only a published stable GitHub Release can be used", 422);
    const asset = ghRelease.assets?.find((item) => item.name === expectedAsset);
    if (!asset || typeof asset.browser_download_url !== "string") return reply("Expected APK asset not found in GitHub Release", 404);
    const url = new URL(asset.browser_download_url);
    if (url.hostname !== "github.com" || !url.pathname.startsWith("/" + OWNER + "/" + REPO + "/releases/download/")) return reply("APK asset URL is outside the official repository", 422);
    const digest = typeof asset.digest === "string" ? asset.digest.toLowerCase() : "";
    if (!/^sha256:[a-f0-9]{64}$/.test(digest)) return reply("GitHub has not supplied a SHA-256 asset digest. Re-upload the APK as a GitHub Release asset and retry.", 422);
    const size = Number(asset.size || 0);
    if (!Number.isSafeInteger(size) || size < 1 || size > MAX_APK_BYTES) return reply("APK asset size is invalid or exceeds 250 MB", 422);

    const db = getAdminDb();
    const releaseRef = db.collection("app_releases").doc(platform);
    const configRef = db.collection("app_remote_config").doc("current");
    const auditRef = db.collection("app_remote_config_audit").doc();
    const published = await db.runTransaction(async (tx) => {
      const [releaseSnap, configSnap] = await Promise.all([tx.get(releaseRef), tx.get(configRef)]);
      const current = releaseSnap.data();
      const currentCode = Number(current?.versionCode || CURRENT_APP_VERSION_CODE);
      const currentName = typeof current?.versionName === "string" ? current.versionName : CURRENT_APP_VERSION_NAME;
      if (currentCode >= Number(versionCode)) throw new Error("VERSION_CODE_NOT_INCREASING");
      if (compareVersions(versionName, currentName) <= 0) throw new Error("VERSION_NAME_NOT_INCREASING");
      if (compareVersions(minimumVersionName, versionName) > 0) throw new Error("MINIMUM_VERSION_ABOVE_RELEASE");
      const config = configSnap.data() || {};
      const latestVersions = { mobile: "0.2.0", tv: "0.2.0", ...(typeof config.latestVersions === "object" ? config.latestVersions : {}) } as Record<string, string>;
      const minimumVersions = { mobile: "0.2.0", tv: "0.2.0", ...(typeof config.minimumVersions === "object" ? config.minimumVersions : {}) } as Record<string, string>;
      const updateUrls = { mobile: "", tv: "", ...(typeof config.updateUrls === "object" ? config.updateUrls : {}) } as Record<string, string>;
      latestVersions[platform] = versionName;
      minimumVersions[platform] = minimumVersionName;
      updateUrls[platform] = UPDATE_PAGE[platform];
      const configVersion = Number.isSafeInteger(config.configVersion) ? Number(config.configVersion) + 1 : 2;
      tx.set(releaseRef, {
        platform, packageName: PACKAGES[platform], versionName, versionCode: Number(versionCode), minimumVersionName,
        releaseNotes, releaseTag: tag, assetName: expectedAsset, githubAssetUrl: asset.browser_download_url,
        sha256: digest.slice(7), sizeBytes: size, contentType: asset.content_type || "application/vnd.android.package-archive",
        active: true, publishedAt: FieldValue.serverTimestamp(), publishedByUid: identity.uid,
      });
      tx.set(configRef, { ...config, schemaVersion: 1, configVersion, latestVersions, minimumVersions, updateUrls, updatedAt: FieldValue.serverTimestamp(), updatedBy: identity.uid });
      tx.create(auditRef, { actorUid: identity.uid, action: "android_apk_release_published", platform, versionName, versionCode: Number(versionCode), sha256: digest.slice(7), previousVersionCode: Number(current?.versionCode || 0), releaseTag: tag, createdAt: FieldValue.serverTimestamp() });
      return { configVersion };
    });
    return NextResponse.json({ success: true, platform, versionName, versionCode: Number(versionCode), sha256: digest.slice(7), sizeBytes: size, githubAssetUrl: asset.browser_download_url, configVersion: published.configVersion }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "VERSION_CODE_NOT_INCREASING") return reply("Version code must be higher than the current release", 409);
    if (code === "VERSION_NAME_NOT_INCREASING") return reply("Version name must be higher than the current release", 409);
    if (code === "MINIMUM_VERSION_ABOVE_RELEASE") return reply("Minimum supported version cannot exceed this release", 400);
    console.error("APK release publish failed:", error);
    return reply("Could not publish APK release", 500);
  }
}
