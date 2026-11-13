import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../");
const moduleSource = readFileSync(resolve(root, "src/modules/creators/dashboard.ts"), "utf8");
const route = readFileSync(resolve(root, "src/app/api/creator/dashboard/route.ts"), "utf8");

test("creator dashboard is bounded to bounded 100 video sample", () => {
  assert.match(route, /\.limit\(100\)/);
  assert.match(moduleSource, /bounded_100_creator_video_sample/);
});
test("dashboard authenticates and checks revoked Firebase tokens", () => {
  assert.match(route, /verifyIdToken\(token, true\)/);
});
test("dashboard never reports unverified earnings as payable", () => {
  assert.match(moduleSource, /available: false/);
  assert.match(moduleSource, /Settlement ledger integration has not been verified/);
});
test("teacher verification is distinct from referral eligibility", () => {
  assert.match(moduleSource, /verified, referralEligible: false/);
});
