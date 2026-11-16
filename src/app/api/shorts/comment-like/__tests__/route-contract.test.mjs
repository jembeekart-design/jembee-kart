import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../route.ts", import.meta.url), "utf8");
const handler = await readFile(new URL("../handler.ts", import.meta.url), "utf8");
const client = await readFile(new URL("../../../../../lib/videos/watch-earn/likeVideoComment.ts", import.meta.url), "utf8");

test("comment likes use revocation-checked bearer authentication", () => {
  assert.match(route, /verifyIdToken\(token, true\)/);
  assert.match(handler, /startsWith\("Bearer "\)/);
  assert.match(handler, /token\.length > 8192/);
  assert.match(client, /Authorization: "Bearer " \+ token/);
});

test("comment identifiers and request bodies are bounded", () => {
  assert.match(handler, /encode\\(raw\\)\\.byteLength > 8192/);
  assert.match(handler, /commentId\\.length > 500/);
  assert.ok(handler.includes("/[\\\\\\\\/]/.test(commentId)"));
});
test("comment likes require a currently available safe video", () => {
  assert.match(handler, /videoData\.active !== true/);
  assert.match(handler, /videoData\.status !== "approved"/);
  assert.match(handler, /videoData\.moderation !== "safe"/);
});

test("comment likes are idempotent and retain legacy like records", () => {
  assert.match(handler, /createHash\("sha256"\)/);
  assert.match(handler, /legacyLikeRef/);
  assert.match(handler, /like\.exists \|\| legacyLike\.exists/);
  assert.match(handler, /alreadyLiked: true/);
});
