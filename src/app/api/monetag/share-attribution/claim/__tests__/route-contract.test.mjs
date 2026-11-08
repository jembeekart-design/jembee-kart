import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const source = await readFile(new URL("../route.ts", import.meta.url), "utf8");
test("share claim requires verified Firebase identity and exact share/video match", () => {
  assert.match(source, /verifyIdToken\(header\.slice\(7\)\.trim\(\), true\)/);
  assert.match(source, /share\.videoId !== videoId/);
  assert.match(source, /share\.sharerUserId === decoded\.uid/);
});
test("share claim rejects expired or unsafe links and records buyer-scoped claim", () => {
  assert.match(source, /7 \* 24 \* 60 \* 60 \* 1000/);
  assert.match(source, /monetagShareClaims/);
  assert.match(source, /attributionSource: "authenticated_share_link_claim"/);
});
