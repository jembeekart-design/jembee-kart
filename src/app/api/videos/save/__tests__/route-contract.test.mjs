import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync(new URL("../route.ts", import.meta.url), "utf8");
const feed = readFileSync(new URL("../../../../videos/components/VerticalVideoFeed.tsx", import.meta.url), "utf8");

test("saved video API requires a revocation-checked Firebase bearer token", () => {
  assert.match(route, /authorization\.startsWith\("Bearer "\)/);
  assert.match(route, /verifyIdToken\(token, true\)/);
  assert.match(route, /MAX_TOKEN_LENGTH/);
});

test("saved video API validates intent and only saves approved safe free videos", () => {
  assert.match(route, /typeof saved !== "boolean"/);
  assert.match(route, /video\?\.status !== "approved"/);
  assert.match(route, /video\?\.active !== true/);
  assert.match(route, /video\?\.moderation !== "safe"/);
  assert.match(route, /video\?\.videoAccess !== "free"/);
  assert.match(route, /runTransaction/);
});

test("Shorts save action persists state through the authenticated API", () => {
  assert.match(feed, /fetch\("\/api\/videos\/save"/);
  assert.match(feed, /JSON\.stringify\(\{ videoId: video\.id, saved: nextSaved \}\)/);
  assert.match(feed, /setSavedVideos\(prev => \(\{ \.\.\.prev, \[video\.id\]: result\.saved === true \}\)\)/);
});

test("saved video list is loaded from the server for the current account", () => {
  assert.match(route, /where\("userId", "==", decoded\.uid\)/);
  assert.match(feed, /fetch\("\/api\/videos\/save", \{/);
  assert.match(feed, /result\.videoIds/);
});

test("a user can always remove a stale saved-video reference", () => {
  assert.match(route, /if \(!saved\) \{\s*if \(saveSnap\.exists\) transaction\.delete\(saveRef\);\s*return \{ saved: false \};\s*\}/);
  assert.ok(route.indexOf("if (!saved)") < route.indexOf('if (!videoSnap.exists) return { error: "VIDEO_UNAVAILABLE"'));
});
