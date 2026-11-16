import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../route.ts", import.meta.url), "utf8");

test("reply API requires revocation-checked Firebase bearer authentication", () => {
  assert.match(route, /verifyIdToken\(token, true\)/);
  assert.match(route, /authorization\?\.startsWith\("Bearer "\)/);
});

test("reply reads and writes require approved parent comment and safe active video", () => {
  assert.match(route, /comment\.data\(\)\?\.status !== "approved"/);
  assert.match(route, /videoData\.status !== "approved"/);
  assert.match(route, /videoData\.active !== true/);
  assert.match(route, /videoData\.moderation !== "safe"/);
});

test("reply input is bounded, moderated, rate-limited and idempotent", () => {
  assert.match(route, /byteLength\(raw\) > 8192/);
  assert.match(route, /reply\.length > 1000/);
  assert.match(route, /blockedWords/);
  assert.match(route, /count >= 5/);
  assert.match(route, /createHash\("sha256"\)/);
});

test("reply and parent reply counter are written atomically", () => {
  assert.match(route, /db\.runTransaction/);
  assert.match(route, /tx\.create\(replyRef/);
  assert.match(route, /tx\.update\(commentRef, \{ replyCount: FieldValue\.increment\(1\) \}\)/);
});
