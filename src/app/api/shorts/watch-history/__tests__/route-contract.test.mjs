import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(here, "../route.ts"), "utf8");

test("watch history requires a non-revoked Firebase identity", () => {
  assert.match(source, /verifyIdToken\(header\.slice\(7\)\.trim\(\), true\)/);
  assert.match(source, /Authentication required/);
});

test("watch history queries only the requesting user's recent sessions", () => {
  assert.match(source, /where\("uid", "==", uid\)/);
  assert.match(source, /orderBy\("startedAtMs", "desc"\)/);
  assert.match(source, /\.limit\(50\)/);
});

test("watch history excludes unavailable, unsafe and paid videos", () => {
  for (const check of ['video.status !== "approved"', "video.active !== true", 'video.moderation !== "safe"', 'video.videoAccess !== "free"']) {
    assert.ok(source.includes(check), `missing visibility check: ${check}`);
  }
});

test("watch history never creates rewards", () => {
  assert.match(source, /elapsedSeconds:/);
  assert.doesNotMatch(source, /wallet|coin|reward|payout/i);
  assert.match(source, /Cache-Control.*no-store/);
});


test("watch history groups repeated sessions into one video entry", () => {
  assert.match(source, /const grouped = new Map<string/);
  assert.match(source, /current\.sessionCount \+= 1/);
  assert.match(source, /sessionCount: 1/);
  assert.match(source, /Array\.from\(grouped\.values\(\)\)/);
});
