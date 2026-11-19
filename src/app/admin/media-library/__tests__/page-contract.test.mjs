import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const pagePath = path.resolve(testDirectory, "../page.tsx");
const routePath = path.resolve(testDirectory, "../../../api/admin/media-library/route.ts");
const adminGuardPath = path.resolve(testDirectory, "../../../../lib/server/requireAdmin.ts");
const deleteRoutePath = path.resolve(testDirectory, "../../../api/admin/delete-video/route.ts");
const deletionServicePath = path.resolve(testDirectory, "../../../../services/videoDeletionService.ts");

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


test("Inventory normalizes Firestore Timestamp and legacy epoch-millisecond dates", async () => {
  const route = await readFile(routePath, "utf8");
  assert.match(route, /createdAtValue\.toDate\(\)/);
  assert.match(route, /new Date\(createdAtValue\)/);
  assert.match(route, /\.limit\(250\)/);
  assert.doesNotMatch(route, /orderBy\("createdAt"/);
});

test("Paid and unsupported-provider media cannot be previewed from the Drive-only stream", async () => {
  const page = await readFile(pagePath, "utf8");
  assert.match(page, /video\.videoAccess !== "paid"/);
  assert.match(page, /video\.storageProvider === "google_drive"/);
  assert.match(page, /onAuthStateChanged\(auth/);
});

test("Admin deletion refuses records without a verified storage asset before cleanup", async () => {
  const route = await readFile(deleteRoutePath, "utf8");
  assert.match(route, /requireAdmin\(req\)/);
  assert.match(route, /if \(!driveFileId && !storedPublicId\)/);
  assert.match(route, /No verified Drive or Cloudinary asset reference/);
});

test("Video deletion archives notifications and reconciles unread metadata", async () => {
  const service = await readFile(deletionServicePath, "utf8");
  assert.match(service, /archiveVideoNotifications\(db, videoId\)/);
  assert.match(service, /shorts_notifications/);
  assert.match(service, /shorts_notification_meta/);
  assert.match(service, /unreadCount: Math\.max\(0/);
  assert.match(service, /videoId: FieldValue\.delete\(\)/);
});
