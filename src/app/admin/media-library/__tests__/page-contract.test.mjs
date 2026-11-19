import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const pagePath = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../page.tsx");
const routePath = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../../api/admin/media-library/route.ts");
const adminGuardPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../../../lib/server/requireAdmin.ts");

test("Media Library uses the server-side inventory endpoint, not client Firestore reads", async () => {
  const page = await readFile(pagePath, "utf8");
  assert.match(page, /\/api\/admin\/media-library/);
  assert.doesNotMatch(page, /collection\(db,/);
});

test("Media inventory endpoint delegates authentication to the shared revoked-token-aware admin guard", async () => {
  const route = await readFile(routePath, "utf8");
  assert.match(route, /requireAdmin\(req\)/);
  assert.match(route, /isAdminIdentity\(identity\)/);
  assert.match(route, /watchEarnVideos/);
  assert.match(route, /limit\(250\)/);
  assert.doesNotMatch(route, /verifyIdToken/);
});

test("Shared admin guard retries UID lookup when the direct document is not an admin", async () => {
  const guard = await readFile(adminGuardPath, "utf8");
  assert.match(guard, /verifyIdToken\(token, true\)/);
  assert.match(guard, /if \(role !== "admin" && role !== "super_admin"\)\s*\{\s*const fallback = await db\.collection\("users"\)\.where\("uid", "==", decoded\.uid" );
  assert.match(guard, /fallback\.docs\[0\]\?\.data\(\)\?\.role/);
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
