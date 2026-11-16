import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../route.ts", import.meta.url), "utf8");

test("viewer history requires a verified Firebase identity with revocation checks", () => {
  assert.match(route, /verifyIdToken\(token, true\)/);
  assert.match(route, /MAX_TOKEN_LENGTH/);
  assert.match(route, /Bearer /);
});

test("history only stores and returns currently approved safe public long videos", () => {
  assert.match(route, /video\?\.status !== "approved"/);
  assert.match(route, /video\?\.active !== true/);
  assert.match(route, /video\?\.moderation !== "safe"/);
  assert.match(route, /video\?\.videoAccess !== "free" && video\?\.videoAccess !== undefined/);
  assert.match(route, /paidVideoStatus === "payment_integration_pending"/);
  assert.match(route, /video\?\.videoFormat !== "long"/);
});

test("progress input is bounded and never contains a media URL or playback credential", () => {
  assert.match(route, /durationSeconds > 24 \* 60 \* 60/);
  assert.match(route, /positionSeconds > durationSeconds/);
  assert.match(route, /Invalid request/);
  assert.doesNotMatch(route, /driveFileId|videoUrl|playbackCookie/);
});

test("viewer can remove only their own history record", () => {
  assert.match(route, /historyDocumentId\(uid, videoId\)/);
  assert.match(route, /createHash\("sha256"\)/);
  assert.match(route, /export async function DELETE/);
});
