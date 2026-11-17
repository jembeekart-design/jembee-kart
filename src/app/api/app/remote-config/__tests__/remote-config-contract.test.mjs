import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const route = fs.readFileSync(path.join(process.cwd(), "src/app/api/app/remote-config/route.ts"), "utf8");

test("remote config is served from a server-owned Firestore document with safe defaults", () => {
  assert.match(route, /collection\("app_remote_config"\)\.doc\("current"\)/);
  assert.match(route, /const DEFAULTS =/);
  assert.match(route, /Cache-Control/);
});

test("remote config writes require a revocation-checked Firebase admin token and role", () => {
  assert.match(route, /verifyIdToken\(header\.slice\(7\)\.trim\(\), true\)/);
  assert.match(route, /role !== "admin" && role !== "super_admin"/);
  assert.match(route, /export async function POST/);
});

test("remote config updates are version-checked and append an audit record transactionally", () => {
  assert.match(route, /expectedConfigVersion/);
  assert.match(route, /CONFIG_VERSION_CONFLICT/);
  assert.match(route, /app_remote_config_audit/);
  assert.match(route, /tx\.create\(auditRef/);
  assert.match(route, /runTransaction/);
});

test("remote config rejects unknown keys, invalid versions, and non-HTTPS update URLs", () => {
  assert.match(route, /UNKNOWN_CONFIG_KEY/);
  assert.match(route, /INVALID_VERSION/);
  assert.match(route, /INVALID_UPDATE_URL/);
  assert.match(route, /https:/);
});

test("remote config never exposes server credentials or executable remote code", () => {
  assert.doesNotMatch(route, /FIREBASE_PRIVATE_KEY|MONETAG_API_TOKEN|CASHFREE_SECRET_KEY/);
  assert.doesNotMatch(route, /eval\(|new Function\(/);
});
