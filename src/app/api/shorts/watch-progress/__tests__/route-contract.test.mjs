import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(here, "../route.ts"), "utf8");

test("progress API authenticates with revoked-token checking", () => {
  assert.match(source, /verifyIdToken\(header\.slice\(7\)\.trim\(\), true\)/);
});

test("progress writes require an owned active watch session", () => {
  assert.match(source, /session\.uid !== uid/);
  assert.match(source, /session\.status !== "active"/);
  assert.match(source, /db\.runTransaction/);
});

test("resume position is bounded and video eligibility is rechecked", () => {
  assert.match(source, /positionSeconds > 86400/);
  for (const check of ["video.status !== \"approved\"", "video.active !== true", "video.moderation !== \"safe\"", "video.videoAccess !== \"free\""]) {
    assert.ok(source.includes(check), `missing check: ${check}`);
  }
  assert.match(source, /positionSeconds > duration \+ 5/);
});

test("resume data is stored privately under the authenticated user", () => {
  assert.match(source, /collection\("watchProgress"\)/);
  assert.match(source, /uid,/);
  assert.match(source, /telemetryOnly: true/);
  assert.doesNotMatch(source, /walletBalance|totalCoins|createWatchReward|payout/i);
});

test("history response revalidates public video availability", () => {
  assert.match(source, /orderBy\("updatedAt", "desc"\)\.limit\(50\)/);
  assert.match(source, /items: items\.filter\(Boolean\)/);
});

test("resume writes close stale sessions after the four-hour telemetry limit", () => {
  assert.match(source, /nowMs - startedAt > 4 \* 60 \* 60 \* 1000/);
  assert.match(source, /closeReason: "expired"/);
});

test("continue watching fetches unique video records in parallel", () => {
  assert.match(source, /const videoIds = Array\.from\(new Set\(progressRows\.map/);
  assert.match(source, /Promise\.all\(videoIds\.map/);
  assert.match(source, /videosById\.get\(videoId\)/);
  assert.match(source, /scannedProgress: progressSnap\.size, limit: 50/);
});
