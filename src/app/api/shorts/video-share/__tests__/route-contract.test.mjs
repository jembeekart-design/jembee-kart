import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const route = await readFile(new URL("../route.ts", import.meta.url), "utf8");
test("video share writes are authenticated and transactionally idempotent", () => {
  assert.match(route, /verifyIdToken/);
  assert.match(route, /runTransaction/);
  assert.match(route, /watchVideoShares/);
  assert.match(route, /tx\.create\(shareRef/);
  assert.match(route, /tx\.update\(videoRef/);
  assert.match(route, /video\.status !== "approved"/);
  assert.match(route, /video\.moderation !== "safe"/);
});
