import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const client = await readFile(new URL("../followService.ts", import.meta.url), "utf8");
const route = await readFile(new URL("../../../app/api/social/follow/route.ts", import.meta.url), "utf8");

test("client follow actions use authenticated server API instead of direct Firestore writes", () => {
  assert.match(client, /\/api\/social\/follow/);
  assert.match(client, /Authorization: `Bearer ${token}`/);
  assert.doesNotMatch(client, /runTransaction|transaction\.set|transaction\.update/);
});

test("server follow API verifies revoked tokens and updates both relationship edges", () => {
  assert.match(route, /verifyIdToken\(token, true\)/);
  assert.match(route, /tx\.get\(followerEdge\)/);
  assert.match(route, /tx\.get\(followingEdge\)/);
  assert.match(route, /tx\.create\(followerEdge/);
  assert.match(route, /tx\.create\(followingEdge/);
});

test("both follower and following counters are updated transactionally", () => {
  assert.match(route, /followersCount:/);
  assert.match(route, /followingCount:/);
  assert.match(route, /db\.runTransaction/);
});

test("repeated follow and unfollow are idempotent", () => {
  assert.match(route, /hasFollowerEdge && hasFollowingEdge/);
  assert.match(route, /!hasFollowerEdge && !hasFollowingEdge/);
  assert.match(route, /!hasFollowerEdge && !hasFollowingEdge\) return "not-following"/);
});

test("follow notifications are created once with the follow transaction", () => {
  assert.match(route, /notificationSnap/);
  assert.match(route, /tx\.create\(notificationRef/);
});
