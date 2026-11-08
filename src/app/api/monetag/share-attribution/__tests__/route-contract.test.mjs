import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const source = await readFile(new URL("../route.ts", import.meta.url), "utf8");
test("share tokens are random, authenticated and bound to an approved safe video", () => {
  assert.match(source, /randomBytes\(24\)/);
  assert.match(source, /verifyIdToken/);
  assert.match(source, /video\.status !== "approved"/);
  assert.match(source, /video\.moderation !== "safe"/);
});
test("share link preserves video and attribution token on the Shorts route", () => {
  assert.match(source, /`\$\{origin\}\/shorts\?v=/);
  assert.match(source, /&ref=/);
});
