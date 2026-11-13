import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.resolve(process.cwd(), "src/app/api/shorts/comments/route.ts"), "utf8");

test("comment abuse limits are keyed by verified user and updated transactionally", () => {
  assert.match(source, /verifyIdToken\(/);
  assert.match(source, /collection\("commentRateLimits"\)\.doc\(uid\)/);
  assert.match(source, /runTransaction\(async \(tx\)/);
  assert.match(source, /minuteCount >= maxPerMinute \|\| hourCount >= maxPerHour \|\| dayCount >= maxPerDay/);
  assert.match(source, /tx\.set\(rateRef/);
  assert.match(source, /kind === "rate-limited"[\s\S]{0,100}429/);
});

test("comment request id is user-scoped for idempotent submission", () => {
  assert.match(source, /createHash\("sha256"\)\.update\(`\$\{uid\}:\$\{requestId\}`\)/);
  assert.match(source, /existingComment\.exists/);
});
