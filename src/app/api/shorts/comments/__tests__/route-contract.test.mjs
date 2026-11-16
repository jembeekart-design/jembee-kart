import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../route.ts", import.meta.url), "utf8");

test("comment submission verifies Firebase token revocation", () => {
  assert.match(route, /verifyIdToken\([\s\S]*?true\s*\)/);
  assert.match(route, /Bearer /);
});

test("comment input is size-bounded and rejects invalid Firestore document IDs", () => {
  assert.match(route, /content-length/);
  assert.match(route, /Buffer\.byteLength\(raw, "utf8"\) > 8192/);
  assert.match(route, /videoId\.length > 200/);
  assert.ok(route.includes("!/[\\\\/]/.test(videoId)"));
  assert.match(route, /text\.length > 5000/);
});

test("comment writes remain moderation-gated and revalidate video state transactionally", () => {
  assert.match(route, /settings\.enabled !== true/);
  assert.match(route, /settings\.commentsEnabled !== true/);
  assert.match(route, /autoApproveComments === true/);
  assert.match(route, /tx\.get\(videoRef\)/);
  assert.match(route, /currentVideo\.status !== "approved"/);
  assert.match(route, /currentVideo\.moderation !== "safe"/);
});

test("comment idempotency key is scoped by authenticated user and request UUID", () => {
  assert.match(route, /createHash\("sha256"\)/);
  assert.match(route, /update\("\\0"\)/);
  assert.match(route, /update\(requestId\)/);
});
