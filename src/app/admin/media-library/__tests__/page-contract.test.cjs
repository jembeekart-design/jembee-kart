const test = require("node:test");
const assert = require("node:assert/strict");
const { readFile } = require("node:fs/promises");
const path = require("node:path");

const pagePath = path.resolve(__dirname, "../page.tsx");
const routePath = path.resolve(__dirname, "../../../api/admin/media-library/route.ts");

test("Media Library uses the server-side inventory endpoint, not client Firestore reads", async () => {
  const page = await readFile(pagePath, "utf8");
  assert.match(page, /\/api\/admin\/media-library/);
  assert.doesNotMatch(page, /collection\(db,/);
});

test("Media inventory endpoint verifies a revoked-token-aware admin identity", async () => {
  const route = await readFile(routePath, "utf8");
  assert.match(route, /verifyIdToken\([^)]*,\s*true\)/);
  assert.match(route, /role !== "admin".*role !== "super_admin"/s);
  assert.match(route, /watchEarnVideos/);
  assert.match(route, /limit\(250\)/);
});

test("Media Library does not claim unsupported inventory or uploads", async () => {
  const page = await readFile(pagePath, "utf8");
  assert.match(page, /Images/);
  assert.match(page, /Not connected/);
  assert.match(page, /अभी उपलब्ध नहीं है/);
});

test("Preview requires approved active safe video records", async () => {
  const page = await readFile(pagePath, "utf8");
  assert.match(page, /video\.status === "approved" && video\.active && video\.moderation === "safe"/);
  assert.match(page, /\/api\/shorts\/video-stream\//);
});

test("Deletion sends the Firebase ID token to the protected deletion endpoint", async () => {
  const page = await readFile(pagePath, "utf8");
  assert.match(page, /\/api\/admin\/delete-video/);
  assert.match(page, /Authorization: "Bearer " \+ token/);
});
