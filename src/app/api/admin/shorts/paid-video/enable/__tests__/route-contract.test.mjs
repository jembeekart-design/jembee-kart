import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../route.ts", import.meta.url), "utf8");

test("only authenticated admins can enable paid checkout behind environment and Cashfree gates", () => {
  assert.match(source, /verifyIdToken\(header\.slice\(7\)\.trim\(\), true\)/);
  assert.match(source, /role !== "admin" && user\?\.role !== "super_admin"/);
  assert.match(source, /SHORTS_PAID_VIDEO_CHECKOUT_ENABLED !== "true"/);
  assert.match(source, /getCashfreeConfig\(\)/);
});

test("activation only accepts approved safe paid videos and writes explicit flags", () => {
  assert.match(source, /video\.status !== "approved"/);
  assert.match(source, /video\.moderation !== "safe"/);
  assert.match(source, /video\.videoAccess !== "paid"/);
  assert.match(source, /paidVideoStatus: "enabled"/);
  assert.match(source, /paidCheckoutEnabled: true/);
});
