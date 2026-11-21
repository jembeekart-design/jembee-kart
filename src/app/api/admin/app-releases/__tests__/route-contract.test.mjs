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

test("APK publishing verifies a published GitHub Release in the official repository", () => {
  assert.ok(route.includes('const OWNER = "jembeekart-design"'));
  assert.ok(route.includes('const REPO = "jembee-kart"'));
  assert.ok(route.includes("releases/tags/"));
  assert.ok(route.includes("ghRelease.draft || ghRelease.prerelease"));
  assert.ok(route.includes("browser_download_url"));
  assert.ok(route.includes("target.pathname.startsWith"));
});

test("APK publishing requires GitHub SHA-256 digest, valid size and fixed package IDs", () => {
  assert.ok(route.includes("sha256:[a-f0-9]{64}"));
  assert.ok(route.includes("MAX_APK_BYTES"));
  assert.ok(route.includes("in.jembeeplay.mobile"));
  assert.ok(route.includes("in.jembeeplay.tv"));
});

test("APK publishing enforces increasing versions and publishes Firestore transactionally", () => {
  assert.ok(route.includes("VERSION_CODE_NOT_INCREASING"));
  assert.ok(route.includes("VERSION_NAME_NOT_INCREASING"));
  assert.ok(route.includes("CURRENT_APP_VERSION_CODE = 2"));
  assert.ok(route.includes("app_remote_config"));
  assert.ok(route.includes("app_remote_config_audit"));
  assert.ok(route.includes("runTransaction"));
  assert.ok(route.includes("githubAssetUrl"));
});

test("public release metadata exposes a stable download endpoint without leaking private credentials", () => {
  assert.ok(publicRoute.includes("release.active !== true"));
  assert.ok(publicRoute.includes("/api/app/releases/"));
  assert.ok(publicRoute.includes("Cache-Control"));
});

test("APK download redirects only to an official repository GitHub Release asset", () => {
  assert.ok(publicDownload.includes("githubAssetUrl"));
  assert.ok(publicDownload.includes('target.hostname !== "github.com"'));
  assert.ok(publicDownload.includes("/jembeekart-design/jembee-kart/releases/download/"));
  assert.ok(publicDownload.includes("NextResponse.redirect"));
});

test("admin UI uses GitHub Releases and does not upload through Firebase Storage", () => {
  assert.ok(page.includes("releases/new"));
  assert.ok(page.includes("Verify & Publish to Firestore"));
  assert.ok(page.includes("releaseTag"));
  assert.ok(!page.includes("uploadBytesResumable"));
  assert.ok(!page.includes('from "firebase/storage"'));
});
