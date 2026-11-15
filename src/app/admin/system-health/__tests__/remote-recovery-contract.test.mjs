import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), "utf8");
const admin = read("src/app/admin/system-health/page.tsx");
const checkout = read("src/app/api/shorts/paid-video/create-order/route.ts");
const playback = read("src/app/api/shorts/paid-video/playback-session/route.ts");
const health = read("src/app/api/admin/system-health/route.ts");

test("remote recovery admin page authenticates with Firebase and saves through authenticated API", () => {
  assert.ok(admin.includes("onAuthStateChanged"));
  assert.ok(admin.includes("Authorization:"));
  assert.ok(admin.includes("expectedConfigVersion"));
  assert.ok(admin.includes("System Health & Remote Recovery"));
});

test("remote paid-video switch is enforced before checkout order creation", () => {
  assert.match(checkout, /app_remote_config/);
  assert.match(checkout, /features\?\.paidVideo !== true/);
  assert.match(checkout, /PAID_VIDEO_REMOTE_DISABLED/);
});

test("remote paid-video switch is enforced before playback session issuance", () => {
  assert.match(playback, /app_remote_config/);
  assert.match(playback, /features\?\.paidVideo !== true/);
  assert.match(playback, /Paid-video playback is temporarily disabled/);
});

test("system health diagnostics require a verified admin and expose only safe provider status", () => {
  assert.match(health, /verifyIdToken\(header\.slice\(7\)\.trim\(\), true\)/);
  assert.match(health, /admin_settings/);
  assert.match(health, /CASHFREE_CREDENTIALS_ENCRYPTION_KEY/);
  assert.doesNotMatch(health, /secretKeyEncrypted\s*:/);
  assert.match(health, /Cache-Control/);
});
