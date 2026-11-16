import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync(new URL("../route.ts", import.meta.url), "utf8");
const feed = readFileSync(new URL("../../../../videos/components/VerticalVideoFeed.tsx", import.meta.url), "utf8");
const videoCard = readFileSync(new URL("../../../../videos/components/VideoCard.tsx", import.meta.url), "utf8");

test("saved video API requires a revocation-checked Firebase bearer token", () => {
  assert.match(route, /export async function GET\(req: NextRequest\)/);
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
  assert.match(route, /if \(!saved\) \{[\s\S]*?if \(saveSnap\.exists\) transaction\.delete\(saveRef\);[\s\S]*?if \(legacySaveSnap\.exists\) transaction\.delete\(legacySaveRef\);[\s\S]*?return \{ saved: false \};[\s\S]*?\}/);
  assert.ok(route.indexOf("if (!saved)") < route.indexOf('if (!videoSnap.exists) return { error: "VIDEO_UNAVAILABLE"'));
});

test("derived video cards use the same persistent saved-video API", () => {
  assert.match(videoCard, /onAuthStateChanged\(auth/);
  assert.match(videoCard, /fetch\(\`\/api\/videos\/save\?videoId=/);
  assert.match(videoCard, /body: JSON\.stringify\(\{ videoId: video\.id, saved: !isSaved \}\)/);
  assert.match(videoCard, /onSave=\{handleSave\}/);
});

test("video cards request one saved-state record instead of downloading the full saved list", () => {
  assert.match(route, /searchParams\.get\("videoId"\)/);
  assert.match(route, /savedCollection.doc(savedDocumentId(requestedVideoId, decoded.uid))/);
  assert.ok(videoCard.includes("fetch(`/api/videos/save?videoId=${encodeURIComponent(video.id)}`"));
  assert.match(videoCard, /setIsSaved\(result\.saved === true\)/);
});


test("saved-video document keys are collision-resistant and request bodies are bounded", () => {
  assert.match(route, /createHash\("sha256"\)/);
  assert.match(route, /\.update\("\\0"\)/);
  assert.match(route, /savedDocumentId\(requestedVideoId, decoded\.uid\)/);
  assert.match(route, /savedDocumentId\(videoId, decoded\.uid\)/);
  assert.match(route, /MAX_BODY_BYTES/);
  assert.match(route, /Request too large/);
});


test("saved-video migration reads and removes legacy keys without creating duplicates", () => {
  assert.match(route, /legacyDocument = savedDocument\.exists \? null/);
  assert.match(route, /legacySaveRef/);
  assert.match(route, /legacySaveSnap\.exists\) transaction\.delete\(legacySaveRef\)/);
  assert.match(route, /!saveSnap\.exists && !legacySaveSnap\.exists/);
});


test("saved-video list batch-filters entries that are no longer public and free", () => {
  assert.match(route, /db\.getAll\(\.\.\.videoRefs\)/);
  assert.match(route, /video\?\.status === "approved"/);
  assert.match(route, /video\?\.active === true/);
  assert.match(route, /video\?\.moderation === "safe"/);
  assert.match(route, /video\?\.videoAccess === "free"/);
  assert.match(route, /availableIds/);
});
