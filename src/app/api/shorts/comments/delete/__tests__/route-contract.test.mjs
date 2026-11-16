import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../route.ts", import.meta.url), "utf8");
const service = await readFile(new URL("../../../../../../firestore/services/socialService.ts", import.meta.url), "utf8");

test("comment deletion verifies a revocation-checked Firebase bearer token", () => {
  assert.match(route, /verifyIdToken\(token, true\)/);
  assert.match(route, /authorization\?\.startsWith\("Bearer "\)/);
});

test("comment deletion is bounded and restricted to its owner", () => {
  assert.match(route, /byteLength\(raw\) > 4096/);
  assert.match(route, /commentId\.length > 500/);
  assert.match(route, /comment\.userId !== uid/);
  assert.match(service, /\/api\/shorts\/comments\/delete/);
  assert.doesNotMatch(service, /deleteDoc\(doc\(db, COMMENTS_COLLECTION/);
});

test("comment and video counter are changed in one transaction", () => {
  assert.match(route, /db\.runTransaction/);
  assert.match(route, /tx\.delete\(commentRef\)/);
  assert.match(route, /tx\.update\(videoRef, \{ comments: Math\.max\(0, safeCount - 1\) \}\)/);
});
