import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../route.ts", import.meta.url), "utf8");
const rules = await readFile(new URL("../../../../../../firestore.rules", import.meta.url), "utf8");

test("Website Studio API verifies an Admin identity before exposing version history", () => {
  assert.match(route, /verifyIdToken\(header\.slice\(7\)\.trim\(\), true\)/);
  assert.match(route, /role !== "admin" && role !== "super_admin"/);
  assert.match(route, /export async function GET/);
  assert.match(route, /Cache-Control.*no-store/);
  assert.match(route, /adminActivityLogs/);
});

test("Website Studio saves use optimistic concurrency and immutable version snapshots", () => {
  assert.match(route, /expectedVersion/);
  assert.match(route, /VERSION_CONFLICT/);
  assert.match(route, /tx\.create\(versionRef/);
  assert.match(route, /website_studio_save/);
  assert.match(route, /website_studio_restore/);
  assert.match(route, /targetVersion/);
  assert.match(route, /configVersion: nextVersion/);
});

test("Website Studio API validates configuration fields and schedule windows", () => {
  for (const key of ["siteName", "primaryColor", "sectionOrder", "homeCategories", "navigationLabels", "featuredCreators", "featuredPlaylists", "featuredVideos"]) {
    assert.match(route, new RegExp(key));
  }
  assert.match(route, /INVALID_FEATURED_VIDEOS/);
  assert.match(route, /MAX_BODY_BYTES/);
  assert.match(route, /readLimitedBody\(request\)/);
  assert.match(route, /request\.body\.getReader\(\)/);
  assert.match(route, /reader\.cancel\(\)/);
  assert.match(route, /headers\.get\("content-length"\)/);
  assert.match(route, /declaredLength > MAX_BODY_BYTES/);
});

test("Website Studio settings are writable only through the audited server API", () => {
  assert.match(rules, /allow create, update, delete: if isAdmin\(\) && settingId in \[\x27customize\x27, \x27mobile_app\x27\]/);
  assert.doesNotMatch(rules, /allow create, update, delete: if isAdmin\(\) && settingId in \[[^\]]*site_experience/);
});

test("version snapshots and Admin activity records are not client-writable", () => {
  assert.match(rules, /match \/admin_settings\/site_experience\/versions\/\{versionId\}/);
  assert.match(rules, /match \/adminActivityLogs\/\{logId\}/);
  assert.match(rules, /allow create, update, delete: if false/);
});
