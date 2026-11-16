import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../route.ts", import.meta.url), "utf8");
const uploadPage = await readFile(new URL("../../../videos/upload/page.tsx", import.meta.url), "utf8");
const adminPage = await readFile(new URL("../../../admin/categories/page.tsx", import.meta.url), "utf8");
const explorePage = await readFile(new URL("../../../explore/page.tsx", import.meta.url), "utf8");

test("catalog writes require a verified signed-in uploader, not admin privileges", () => {
  assert.match(route, /getAdminAuth\(\)\.verifyIdToken\(token, true\)/);
  assert.match(route, /ownerUid: uploaderUid/);
  assert.doesNotMatch(route, /verifyMonetagAdmin/);
  assert.match(route, /action === "save-category"/);
  assert.match(route, /action === "save-school-node"/);
});

test("uploaders can only edit or delete their own catalog entries", () => {
  assert.match(route, /current\.data\(\)\?\.ownerUid !== uploaderUid/);
  assert.match(route, /snap\.data\(\)\?\.ownerUid !== uploaderUid/);
  assert.match(route, /where\("parentId", "==", id\)/);
  assert.match(route, /PARENT_TYPE/);
});

test("upload page lets teachers add missing categories and school hierarchy themselves", () => {
  assert.match(uploadPage, /अपनी नई Category \/ Topic जोड़ें/);
  assert.match(uploadPage, /जानकारी नहीं मिली\? अपनी School entry जोड़ें/);
  assert.match(uploadPage, /createCreatorSchoolNode/);
  assert.match(uploadPage, /createCreatorCategory/);
  assert.match(uploadPage, /Board → School → Class → Subject \/ Book → Chapter → Question/);
});

test("admin catalog page is read-only and directs teachers to the upload flow", () => {
  assert.match(adminPage, /केवल देख सकता है/);
  assert.match(adminPage, /href="\/videos\/upload"/);
  assert.doesNotMatch(adminPage, /save-school-node/);
  assert.doesNotMatch(adminPage, /Publish Category/);
});

test("Explore reads the published catalog for creator-contributed categories", () => {
  assert.match(explorePage, /teacher \/ uploader/);
});

test("catalog text sanitizer removes actual control characters", () => {
  assert.ok(route.includes(String.raw`replace(/[\\u0000-\\u001f\\u007f]/g, "")`));
});

test("new teacher learning nodes remain pending until an admin publishes them", () => {
  assert.match(route, /status: current\?\.exists \? \(current\.data\(\)\?\.status === "published" \? "published" : "pending"\) : "pending"/);
  assert.match(route, /status", "==", "published"/);
});

test("learning catalog endpoint bounds tokens and rejects non-object JSON bodies", () => {
  assert.match(route, /token\.length > 8192/);
  assert.match(route, /!parsed \|\| typeof parsed !== "object" \|\| Array\.isArray\(parsed\)/);
});

test("school learning catalog rejects duplicate sibling names after Unicode normalization", () => {
  assert.match(route, /normalize\("NFKC"\)/);
  assert.match(route, /where\("type", "==", type\)/);
  assert.match(route, /where\("parentId", "==", parentId \|\| null\)/);
  assert.match(route, /doc\.id !== existingId/);
  assert.match(route, /duplicateId: duplicate\.id/);
});
