import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const route = fs.readFileSync(path.join(process.cwd(), "src/app/api/admin/app-releases/route.ts"), "utf8");
const publicRoute = fs.readFileSync(path.join(process.cwd(), "src/app/api/app/releases/[platform]/route.ts"), "utf8");
const publicDownload = fs.readFileSync(path.join(process.cwd(), "src/app/api/app/releases/[platform]/download/route.ts"), "utf8");
const page = fs.readFileSync(path.join(process.cwd(), "src/app/admin/apk-manager/page.tsx"), "utf8");

test("APK publishing requires an admin token", () => {
  assert.ok(route.includes("requireAdmin(request)"));
  assert.ok(route.includes("isAdminIdentity(identity)"));
});

test("APK publishing validates fixed package IDs, increasing versions and publisher identity", () => {
  assert.ok(route.includes("in.jembeeplay.mobile"));
  assert.ok(route.includes("in.jembeeplay.tv"));
  assert.ok(route.includes("VERSION_CODE_NOT_INCREASING"));
  assert.ok(route.includes("VERSION_NAME_NOT_INCREASING"));
  assert.ok(route.includes("custom.uploadedByUid !== identity.uid"));
  assert.ok(route.includes("app-releases/"));
});

test("APK object size, type, metadata and SHA-256 are verified server-side", () => {
  assert.ok(route.includes("MAX_APK_BYTES"));
  assert.ok(route.includes("application/vnd.android.package-archive"));
  assert.ok(route.includes("sha256StorageObject"));
  assert.ok(route.includes("actualHash !== expectedHash"));
});

test("publishing updates remote config and writes an audit record transactionally", () => {
  assert.ok(route.includes("app_remote_config"));
  assert.ok(route.includes("latestVersions"));
  assert.ok(route.includes("minimumVersions"));
  assert.ok(route.includes("updateUrls"));
  assert.ok(route.includes("app_remote_config_audit"));
  assert.ok(route.includes("runTransaction"));
});

test("public release metadata exposes a stable download endpoint without leaking a signed URL", () => {
  assert.ok(publicRoute.includes("release.active !== true"));
  assert.ok(publicRoute.includes("/api/app/releases/"));
  assert.ok(!publicRoute.includes("getSignedUrl"));
  assert.ok(publicRoute.includes("Cache-Control"));
});

test("APK download redirect creates a short-lived signed URL on demand", () => {
  assert.ok(publicDownload.includes("getSignedUrl"));
  assert.ok(publicDownload.includes("5 * 60 * 1000"));
  assert.ok(publicDownload.includes("NextResponse.redirect"));
  assert.ok(publicDownload.includes("Cache-Control"));
});

test("admin UI uploads APKs to Firebase Storage and publishes through authenticated API", () => {
  assert.ok(page.includes("uploadBytesResumable"));
  assert.ok(page.includes('Authorization: "Bearer "'));
  assert.ok(page.includes("Upload & Publish Release"));
  assert.ok(page.includes('crypto.subtle.digest("SHA-256"'));
});
