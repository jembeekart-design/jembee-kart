import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../route.ts", import.meta.url), "utf8");

test("reply likes require a revocation-checked Firebase token and bounded JSON", () => {
  assert.match(route, /verifyIdToken\(token, true\)/);
  assert.match(route, /token\.length > 8192/);
  assert.match(route, /encode\(raw\)\.byteLength > 2048/);
  assert.match(route, /Invalid JSON body/);
});

test("reply likes are limited to approved replies on safe active videos", () => {
  assert.match(route, /reply\.status !== "approved"/);
  assert.match(route, /video\.status !== "approved"/);
  assert.match(route, /video\.active !== true/);
  assert.match(route, /video\.moderation !== "safe"/);
});

test("reply likes use a per-user idempotency edge and atomic counter update", () => {
  assert.match(route, /videoReplyLikes/);
  assert.match(route, /createHash\("sha256"\)/);
  assert.match(route, /db\.runTransaction/);
  assert.match(route, /tx\.create\(likeRef/);
  assert.match(route, /tx\.update\(replyRef, \{ likes:/);
});
