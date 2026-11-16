import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../route.ts", import.meta.url), "utf8");

test("follow list endpoint requires revocation-checked authentication", () => {
  assert.match(route, /verifyIdToken\(token, true\)/);
  assert.match(route, /authorization\?\.startsWith\("Bearer "\)/);
});

test("only the authenticated user's followers or following subcollection can be queried", () => {
  assert.match(route, /type !== "followers" && type !== "following"/);
  assert.match(route, /collection\(type\)/);
  assert.match(route, /collection\("users"\)\.doc\(uid\)/);
});

test("follow list is bounded and returns limited public profile fields", () => {
  assert.match(route, /Math\.min\(100/);
  assert.match(route, /limit\(limit \+ 1\)/);
  assert.match(route, /hasMore/);
  assert.match(route, /photoUrl:/);
  assert.doesNotMatch(route, /email:|phone:|wallet|earnings/);
});

test("cursor pagination validates the cursor and advances deterministically", () => {
  assert.match(route, /searchParams\.get\("cursor"\)/);
  assert.match(route, /orderBy\("__name__"\)/);
  assert.match(route, /startAfter\(cursor\)/);
  assert.match(route, /nextCursor:/);
});
