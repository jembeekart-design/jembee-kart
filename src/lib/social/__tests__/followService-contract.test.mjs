import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../followService.ts", import.meta.url), "utf8");
const notification = await readFile(new URL("../notificationService.ts", import.meta.url), "utf8");
const follow = source.slice(source.indexOf("export const followUser"), source.indexOf("/**\n * Unfollow a user"));
const unfollow = source.slice(source.indexOf("export const unfollowUser"), source.indexOf("export const isFollowing"));

test("follow reads both relationship edges and repairs a one-sided legacy edge", () => {
  assert.match(follow, /transaction\.get\(followRef\)/);
  assert.match(follow, /transaction\.get\(followingRef\)/);
  assert.match(follow, /if \(!hasFollowerEdge\)/);
  assert.match(follow, /if \(!hasFollowingEdge\)/);
});

test("follow counter increments only for a brand-new relationship", () => {
  assert.match(follow, /const isNewRelationship = !hasFollowerEdge && !hasFollowingEdge/);
  assert.match(follow, /if \(isNewRelationship\)\s*\{\s*transaction\.update\(followerRef/);
});

test("follow notification is emitted only for a new relationship", () => {
  assert.match(follow, /if \(isNewRelationship\)\s*\{\s*await sendFollowNotification/);
  assert.match(notification, /follow_\$\{targetUid\}_\$\{followerUid\}/);
  assert.match(notification, /\{ merge: true \}/);
});

test("unfollow reads both relationship edges before changing state", () => {
  assert.match(unfollow, /transaction\.get\(followRef\)/);
  assert.match(unfollow, /transaction\.get\(followingRef\)/);
  assert.match(unfollow, /transaction\.get\(followerRef\)/);
});

test("repeated unfollow with no relationship edge does not decrement counters", () => {
  assert.match(unfollow, /if \(!hasFollowerEdge && !hasFollowingEdge\)\s*\{\s*return;\s*\}/);
  assert.match(unfollow, /if \(hasFollowerEdge\) transaction\.delete\(followRef\)/);
  assert.match(unfollow, /if \(hasFollowingEdge\) transaction\.delete\(followingRef\)/);
  assert.match(unfollow, /Math\.max\(0, currentFollowingCount - 1\)/);
});

test("unfollow counter input is finite and normalized", () => {
  assert.match(unfollow, /Number\.isFinite\(followerData\.followingCount\)/);
  assert.match(unfollow, /Math\.floor\(followerData\.followingCount\)/);
});
