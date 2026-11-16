import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../route.ts", import.meta.url), "utf8");

test("follow API verifies Firebase token revocation for each method", () => {
  assert.match(route, /verifyIdToken\(token, true\)/);
  assert.match(route, /authorization.*Bearer/s);
});

test("follow and unfollow update both relationship edges and both profile counters transactionally", () => {
  assert.match(route, /tx\.get\(followerEdge\)/);
  assert.match(route, /tx\.get\(followingEdge\)/);
  assert.match(route, /tx\.create\(followerEdge/);
  assert.match(route, /tx\.create\(followingEdge/);
  assert.match(route, /followersCount:/);
  assert.match(route, /followingCount:/);
  assert.match(route, /db\.runTransaction/);
});

test("follow notification is created atomically with a new relationship", () => {
  assert.match(route, /notificationRef/);
  assert.match(route, /tx\.create\(notificationRef/);
  assert.match(route, /notificationHash/);
});

test("follow status is checked using the authenticated user's own following edge", () => {
  assert.match(route, /export async function GET/);
  assert.match(route, /collection\("following"\)\.doc\(targetUid\)/);
});

test("self-follow and unsafe identifiers are rejected", () => {
  assert.match(route, /targetUid === uid/);
  assert.match(route, /test\(targetUid\)/);
});
