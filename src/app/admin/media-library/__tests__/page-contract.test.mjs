import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const pageUrl = new URL("../page.tsx", import.meta.url);
const routeUrl = new URL("../../../../api/admin/media-library/route.ts", import.meta.url);

test("Media Library uses the server-side inventory endpoint, not client Firestore reads", async () => {
  const page = await readFile(pageUrl, "utf8");
  assert.match(page, /\/api\/admin\/media-library/);
  assert.doesNotMatch(page, /collection\(db,/);
});

test("Media inventory endpoint verifies a revoked-token-aware admin identity", async () => {
  const route = await readFile(routeUrl, "utf8");
  assert.match(route, /verifyIdToken\([^)]*,\s*true\)/);
  assert.match(route, /role !== "admin".*role !== "super_admin"/s);
  assert.match(route, /watchEarnVideos/);
  assert.match(route, /limit\(250\)/);
});

test("Media Library does not claim unsupported inventory or uploads", async () => {
  const page = await readFile(pageUrl, "utf8");
  assert.match(page, /Images/);
  assert.match(page, /Not connected/);
  assert.match(page, /अभी उपलब्ध नहीं है/);
});

test("Preview requires approved active safe video records", async () => {
  const page = await readFile(pageUrl, "utf8");
  assert.match(page, /video\.status === "approved" && video\.active && video\.moderation === "safe"/);
  assert.match(page, /\/api\/shorts\/video-stream\//);
});

test("Deletion sends the Firebase ID token to the protected deletion endpoint", async () => {
  const page = await readFile(pageUrl, "utf8");
  assert.match(page, /\/api\/admin\/delete-video/);
  assert.match(page, /Authorization: "Bearer " \+ token/);
});
