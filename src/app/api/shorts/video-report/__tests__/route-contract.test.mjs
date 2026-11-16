import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../route.ts", import.meta.url), "utf8");
const client = await readFile(new URL("../../../../../lib/videos/watch-earn/reportVideo.ts", import.meta.url), "utf8");

test("report endpoint uses revocation-checked bearer authentication", () => {
  assert.match(route, /authorization\?\.startsWith\("Bearer "\)/);
  assert.match(route, /verifyIdToken\(token, true\)/);
  assert.match(client, /Authorization: `Bearer \$\{token\}`/);
  assert.doesNotMatch(client, /message: data\.message \|\| "",\s*token/);
});

test("report endpoint validates bounded input and allowed reasons", () => {
  assert.match(route, /byteLength\(raw\) > 8192/);
  assert.match(route, /videoId\.length > 200/);
  assert.match(route, /ALLOWED_REASONS\.includes\(reason\)/);
  assert.match(route, /message\.length > 1000/);
});

test("report endpoint checks current video eligibility and hashes report key", () => {
  assert.match(route, /video\.active !== true/);
  assert.match(route, /video\.status !== "approved"/);
  assert.match(route, /video\.moderation !== "safe"/);
  assert.match(route, /createHash\("sha256"\)/);
  assert.match(route, /alreadyReported/);
});
