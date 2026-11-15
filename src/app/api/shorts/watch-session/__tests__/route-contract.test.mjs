import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(here, "../route.ts"), "utf8");

test("watch session requires a non-revoked Firebase identity", () => {
  assert.match(source, /verifyIdToken\([^\n]+,\s*true\)/);
  assert.match(source, /Authentication required/);
});

test("watch session accepts only approved, active, safe free videos", () => {
  for (const field of ["status !== \"approved\"", "active !== true", "moderation !== \"safe\"", "videoAccess !== \"free\""]) {
    assert.ok(source.includes(field), `missing eligibility check: ${field}`);
  }
});

test("heartbeat duration is calculated from server time and bounded", () => {
  assert.match(source, /const elapsed = Math\.floor\(\(now - previous\) \/ 1000\)/);
  assert.match(source, /Math\.min\(elapsed, MAX_HEARTBEAT_SECONDS\)/);
  assert.match(source, /MIN_HEARTBEAT_SECONDS = 8/);
  assert.match(source, /MAX_HEARTBEAT_SECONDS = 20/);
  assert.doesNotMatch(source, /body\.watchSeconds|body\.elapsedSeconds|body\.duration/);
});

test("session ownership and active state are checked transactionally", () => {
  assert.match(source, /db\.runTransaction/);
  assert.match(source, /data\.uid !== uid/);
  assert.match(source, /data\.status !== "active"/);
  assert.match(source, /status: "closed"/);
});

test("telemetry is explicitly not a reward verification signal", () => {
  assert.match(source, /telemetryOnly: true/);
  assert.doesNotMatch(source, /wallet|coin|reward|payout/i);
});
