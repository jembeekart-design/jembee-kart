import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const route = await readFile(new URL("../route.ts", import.meta.url), "utf8");
test("reply delete requires a revocation-checked Firebase token", () => {
  assert.match(route, /verifyIdToken\(token, true\)/);
  assert.match(route, /token\.length > 8192/);
});
test("reply delete validates input and requires ownership", () => {
  assert.match(route, /byteLength\(raw\) > 4096/);
  assert.match(route, /reply\.userId !== uid/);
  assert.match(route, /Invalid reply ID/);
});
test("reply deletion and parent count decrement are atomic and nonnegative", () => {
  assert.match(route, /db\.runTransaction/);
  assert.match(route, /tx\.delete\(replyRef\)/);
  assert.match(route, /Math\.max\(0,/);
  assert.match(route, /tx\.update\(commentRef/);
});
