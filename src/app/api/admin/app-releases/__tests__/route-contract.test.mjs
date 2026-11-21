import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const route = fs.readFileSync(path.join(process.cwd(), "src/app/api/admin/app-releases/route.ts"), "utf8");
const publicRoute = fs.readFileSync(path.join(process.cwd(), "src/app/api/app/releases/[platform]/route.ts"), "utf8");
const page = fs.readFileSync(path.join(process.cwd(), "src/app/admin/apk-manager/page.tsx"), "utf8");
const publicDownload = fs.readFileSync(path.join(process.cwd(), "src/app/api/app/releases/[platform]/download/route.ts"), "utf8");

test("APK publishing requires an admin token", () => {
  assert.match(route, /requireAdmin\(request\)/);
  assert.match(route, /isAdminIdentity\(identity\)/);
});

test("APK publishing validates fixed package IDs, increasing version code and private Storage path", () => {
  assert.match(route, /in\.jembeeplay\.mobile/);
  assert.match(route, /in\.jembeeplay\.tv/);
  assert.match(route, /VERSION_CODE_NOT_INCREASING/);
  assert.match(route, /VERSION_NAME_NOT_INCREASING/);
  assert.match(route, /custom\.uploadedByUid !== identity\.uid/);
  assert.match(route, /app-releases/);
});

test("APK object size, type, metadata and SHA-256 are verified server-side", () => {
  assert.match(route, /MAX_APK_BYTES/);
  assert.match(route, /application\/vnd\.android\.package-archive/);
  assert.match(route, /sha256StorageObject/);
  assert.match(route, /actualHash !== expectedHash/);
});

test("publishing updates remote config and writes an audit record transactionally", () => {
  assert.match(route, /app_remote_config/);
  assert.match(route, /latestVersions/);
  assert.match(route, /minimumVersions/);
  assert.match(route, /updateUrls/);
  assert.match(route, /app_remote_config_audit/);
  assert.match(route, /runTransaction/);
});

test("public download endpoint returns short-lived signed URLs only for published releases", () => {
  assert.match(publicRoute, /release\.active !== true/);
  assert.match(publicRoute, /getSignedUrl/);
  assert.match(publicRoute, /15 \* 60 \* 1000/);
  assert.match(publicRoute, /Cache-Control/);
});

test("admin UI uploads APKs to Firebase Storage and publishes through authenticated API", () => {
  assert.match(page, /uploadBytesResumable/);
  assert.match(page, /Authorization: "Bearer "/);
  assert.match(page, /Upload & Publish Release/);
  assert.match(page, /crypto\.subtle\.digest\("SHA-256"/);
});
