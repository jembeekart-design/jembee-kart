import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../route.ts", import.meta.url), "utf8");
test("follow notification endpoint verifies a revocation-checked bearer token", () => {
  assert.match(route, /verifyIdToken\(token, true\)/);
  assert.match(route, /authorization\?\.startsWith\("Bearer "\)/);
});
test("follow notification is bound to an existing two-sided relationship", () => {
  assert.match(route, /tx\.get\(followerEdge\)/);
  assert.match(route, /tx\.get\(followingEdge\)/);
  assert.match(route, /!followerSnap\.exists \|\| !followingSnap\.exists/);
});
test("follow notification creation is deterministic and transactional", () => {
  assert.match(route, /createHash\("sha256"\)/);
  assert.match(route, /tx\.create\(notificationRef/);
  assert.match(route, /notificationSnap\.exists/);
});
test("notification sender is derived from authenticated account, not request body", () => {
  assert.match(route, /getAdminAuth\(\)\.getUser\(uid\)/);
  assert.doesNotMatch(route, /body\.followerName/);
});
