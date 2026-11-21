import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, getAdminStorage } from "@/firebase/admin";
import { requireAdmin, isAdminIdentity } from "@/lib/server/requireAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VERSION = /^\d{1,4}\.\d{1,4}\.\d{1,4}$/;
const MAX_APK_BYTES = 250 * 1024 * 1024;
const CURRENT_APP_VERSION_CODE = 2;
const CURRENT_APP_VERSION_NAME = "0.2.0";
const PACKAGES = { mobile: "in.jembeeplay.mobile", tv: "in.jembeeplay.tv" } as const;
const UPDATE_PAGE = { mobile: "https://jembeeplay.in/download#android-mobile", tv: "https://jembeeplay.in/download#android-tv" } as const;

function compareVersions(left: string, right: string): number {
  const a = left.split(".").map(Number);
  const b = right.split(".").map(Number);
  for (let index = 0; index < 3; index++) {
    if (a[index] !== b[index]) return a[index] > b[index] ? 1 : -1;
  }
  return 0;
}

function reply(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status, headers: { "Cache-Control": "no-store" } });
}

async function sha256StorageObject(path: string): Promise<string> {
  const hash = createHash("sha256");
  const stream = getAdminStorage().bucket().file(path).createReadStream();
  for await (const chunk of stream) hash.update(chunk as Buffer);
  return hash.digest("hex");
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
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return reply("Invalid request body", 400);
      body = parsed as Record<string, unknown>;
    } catch {
      return reply("Invalid JSON", 400);
    }
    const platform = body.platform;
    if (platform !== "mobile" && platform !== "tv") return reply("Invalid platform", 400);
    const versionName = typeof body.versionName === "string" ? body.versionName.trim() : "";
    const versionCode = body.versionCode;
    const minimumVersionName = typeof body.minimumVersionName === "string" ? body.minimumVersionName.trim() : "";
    const releaseNotes = typeof body.releaseNotes === "string" ? body.releaseNotes.trim().slice(0, 2000) : "";
    const storagePath = typeof body.storagePath === "string" ? body.storagePath : "";
    const expectedHash = typeof body.sha256 === "string" ? body.sha256.toLowerCase() : "";
    const packageName = PACKAGES[platform];

    if (!VERSION.test(versionName) || !VERSION.test(minimumVersionName) ||
        !Number.isSafeInteger(versionCode) || Number(versionCode) < 1 ||
        !/^[a-f0-9]{64}$/.test(expectedHash) ||
        storagePath !== "app-releases/" + platform + "/" + versionCode + "/" + platform + "-" + versionCode + ".apk") {
      return reply("Invalid release metadata", 400);
    }

    const file = getAdminStorage().bucket().file(storagePath);
    const [exists] = await file.exists();
    if (!exists) return reply("Uploaded APK not found", 404);
    const [metadata] = await file.getMetadata();
    const size = Number(metadata.size || 0);
    const contentType = String(metadata.contentType || "").toLowerCase();
    const custom = metadata.metadata || {};
    if (!Number.isSafeInteger(size) || size < 1 || size > MAX_APK_BYTES ||
        !["application/vnd.android.package-archive", "application/octet-stream"].includes(contentType) ||
        custom.platform !== platform || custom.versionCode !== String(versionCode) ||
        custom.packageName !== packageName || custom.sha256 !== expectedHash || custom.uploadedByUid !== identity.uid) {
      return reply("APK object metadata failed validation", 422);
    }

    const actualHash = await sha256StorageObject(storagePath);
    if (actualHash !== expectedHash) return reply("APK checksum verification failed", 422);

    const db = getAdminDb();
    const releaseRef = db.collection("app_releases").doc(platform);
    const configRef = db.collection("app_remote_config").doc("current");
    const auditRef = db.collection("app_remote_config_audit").doc();
    const published = await db.runTransaction(async (tx) => {
      const [releaseSnap, configSnap] = await Promise.all([tx.get(releaseRef), tx.get(configRef)]);
      const currentRelease = releaseSnap.data();
      const currentVersionCode = Number(currentRelease?.versionCode || CURRENT_APP_VERSION_CODE);
      const currentVersionName = typeof currentRelease?.versionName === "string" ? currentRelease.versionName : CURRENT_APP_VERSION_NAME;
      if (currentVersionCode >= Number(versionCode)) throw new Error("VERSION_CODE_NOT_INCREASING");
      if (compareVersions(versionName, currentVersionName) <= 0) throw new Error("VERSION_NAME_NOT_INCREASING");
      const minimumParts = minimumVersionName.split(".").map(Number);
      const releaseParts = versionName.split(".").map(Number);
      const minimumGreater = minimumParts.some((part, index) => {
        for (let prior = 0; prior < index; prior++) if (minimumParts[prior] !== releaseParts[prior]) return false;
        return part > releaseParts[index];
      });
      if (minimumGreater) throw new Error("MINIMUM_VERSION_ABOVE_RELEASE");

      const currentConfig = configSnap.data() || {};
      const latestVersions = { mobile: "0.2.0", tv: "0.2.0", ...(typeof currentConfig.latestVersions === "object" ? currentConfig.latestVersions : {}) } as Record<string, string>;
      const minimumVersions = { mobile: "0.2.0", tv: "0.2.0", ...(typeof currentConfig.minimumVersions === "object" ? currentConfig.minimumVersions : {}) } as Record<string, string>;
      const updateUrls = { mobile: "", tv: "", ...(typeof currentConfig.updateUrls === "object" ? currentConfig.updateUrls : {}) } as Record<string, string>;
      latestVersions[platform] = versionName;
      minimumVersions[platform] = minimumVersionName;
      updateUrls[platform] = UPDATE_PAGE[platform];
      const configVersion = Number.isSafeInteger(currentConfig.configVersion) ? Number(currentConfig.configVersion) + 1 : 2;

      tx.set(releaseRef, {
        platform, packageName, versionName, versionCode: Number(versionCode), minimumVersionName,
        releaseNotes, storagePath, sha256: actualHash, sizeBytes: size, contentType,
        active: true, publishedAt: FieldValue.serverTimestamp(), publishedByUid: identity.uid,
      });
      tx.set(configRef, {
        ...currentConfig, schemaVersion: 1, configVersion, latestVersions, minimumVersions, updateUrls,
        updatedAt: FieldValue.serverTimestamp(), updatedBy: identity.uid,
      });
      tx.create(auditRef, {
        actorUid: identity.uid, action: "android_apk_release_published", platform,
        versionName, versionCode: Number(versionCode), sha256: actualHash,
        previousVersionCode: Number(currentRelease?.versionCode || 0), createdAt: FieldValue.serverTimestamp(),
      });
      return { configVersion };
    });

    return NextResponse.json({
      success: true, platform, versionName, versionCode: Number(versionCode),
      sha256: actualHash, sizeBytes: size, configVersion: published.configVersion,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "VERSION_CODE_NOT_INCREASING") return reply("Version code must be higher than the current release", 409);
    if (code === "VERSION_NAME_NOT_INCREASING") return reply("Version name must be higher than the current release", 409);
    if (code === "MINIMUM_VERSION_ABOVE_RELEASE") return reply("Minimum supported version cannot exceed this release", 400);
    console.error("APK release publish failed:", error);
    return reply("Could not publish APK release", 500);
  }
}
