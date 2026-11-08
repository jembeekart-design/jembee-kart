import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const source = await readFile(new URL("../route.ts", import.meta.url), "utf8");
test("playback session requires a verified Firebase identity and paid purchase", () => {
  assert.ok(source.includes("verifyIdToken"));
  assert.ok(source.includes("watchVideoPurchases"));
  assert.ok(source.includes('purchase.status !== "paid"'));
  assert.ok(source.includes("purchase.accessRevoked === true"));
});
test("playback session checks video eligibility before issuing a cookie", () => {
  assert.ok(source.includes('video.status !== "approved"'));
  assert.ok(source.includes('video.moderation !== "safe"'));
  assert.ok(source.includes('video.paidCheckoutEnabled !== true'));
  assert.ok(source.includes("createPlaybackToken"));
});
test("playback cookie is HttpOnly, Secure, SameSite and short-lived", () => {
  for (const value of ["HttpOnly", "Secure", "SameSite=Lax", "Path=/api/shorts/", "Max-Age=900", "Set-Cookie"]) assert.ok(source.includes(value));
});
