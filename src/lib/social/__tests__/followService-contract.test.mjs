import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../followService.ts", import.meta.url), "utf8");
const unfollow = source.slice(source.indexOf("export const unfollowUser"), source.indexOf("export const isFollowing"));

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
