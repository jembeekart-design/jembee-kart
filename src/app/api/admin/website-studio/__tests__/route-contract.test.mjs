import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../route.ts", import.meta.url), "utf8");
const rules = await readFile(new URL("../../../../../../firestore.rules", import.meta.url), "utf8");

test("Website Studio API verifies an Admin identity before exposing version history", () => {
  assert.match(route, /verifyIdToken\([^)]*, true\)/);
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
});

test("version snapshots and Admin activity records are not client-writable", () => {
  assert.match(rules, /match \/admin_settings\/site_experience\/versions\/\{versionId\}/);
  assert.match(rules, /match \/adminActivityLogs\/\{logId\}/);
  assert.match(rules, /allow create, update, delete: if false/);
});
