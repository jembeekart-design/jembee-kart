import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../route.ts", import.meta.url), "utf8");
const client = await readFile(new URL("../../../../../lib/videos/watch-earn/likeVideo.ts", import.meta.url), "utf8");

test("like endpoint authenticates with a revocation-checked bearer token", () => {
  assert.match(route, /authorization\?\.startsWith\("Bearer "\)/);
  assert.match(route, /verifyIdToken\(token, true\)/);
  assert.match(client, /Authorization: `Bearer \$\{token\}`/);
  assert.doesNotMatch(client, /JSON\.stringify\(\{[^}]*token/);
});

test("like endpoint bounds input and hashes composite identifiers", () => {
  assert.match(route, /byteLength\(raw\) > 4096/);
  assert.match(route, /videoId\.length > 200/);
  assert.match(route, /createHash\("sha256"\)/);
  assert.match(route, /update\("\\0"\)/);
});

test("like writes are idempotent and require an approved safe video", () => {
  assert.match(route, /video\.active !== true/);
  assert.match(route, /video\.status !== "approved"/);
  assert.match(route, /video\.moderation !== "safe"/);
  assert.match(route, /if \(likeSnap\.exists\) return \{ success: true/);
});
