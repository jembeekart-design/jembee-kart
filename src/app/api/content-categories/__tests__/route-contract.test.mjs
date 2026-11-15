import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../route.ts", import.meta.url), "utf8");
const uploadPage = await readFile(new URL("../../../videos/upload/page.tsx", import.meta.url), "utf8");
const adminPage = await readFile(new URL("../../../admin/categories/page.tsx", import.meta.url), "utf8");
const explorePage = await readFile(new URL("../../../explore/page.tsx", import.meta.url), "utf8");

test("learning master catalog writes require a verified admin or super_admin", () => {
  assert.match(route, /getAdminAuth\(\)\.verifyIdToken\(header\.slice\(7\)\.trim\(\), true\)/);
  assert.match(route, /role !== "admin" && role !== "super_admin"/);
  assert.match(route, /action === "save-school-node" \|\| action === "delete-school-node"/);
  assert.match(route, /managedBy: "admin"/);
});

test("catalog supports only Subject, Book, Chapter and Question hierarchy", () => {
  assert.match(route, /const NODE_TYPES = \["subject", "book", "chapter", "question"\]/);
  assert.match(route, /subject: \[\]/);
  assert.match(route, /book: \["subject"\]/);
  assert.match(route, /chapter: \["book"\]/);
  assert.match(route, /question: \["chapter"\]/);
  assert.doesNotMatch(route, /"edition"/);
  assert.match(route, /coverImageUrl/);
  assert.match(route, /bulk-import-learning-library/);
  assert.match(route, /हर Book entry के साथ cover image आवश्यक है/);
  assert.match(adminPage, /Choose JSON dataset/);
  assert.match(route, /where\("parentId", "==", id\)/);
  assert.match(route, /!children\.empty/);
  assert.match(route, /const visited = new Set<string>/);
  assert.match(route, /Import file में पूरी Subject → Book → Chapter → Question hierarchy valid होनी चाहिए/);
  assert.match(route, /parentId \\|\\| null/);
  assert.match(route, /इस entry के अंदर child entries हैं/);
  assert.match(route, /Import किसी existing entry का type नहीं बदल सकता/);
  assert.match(route, /Import किसी ऐसे parent को move नहीं कर सकता/);
});

test("teachers select existing Subject Book Chapter Question and cannot create master entries", () => {
  assert.match(uploadPage, /Subject → Book → Chapter → Question/);
  assert.match(uploadPage, /coverImageUrl/);
  assert.match(uploadPage, /schoolSubjectId/);
  assert.match(uploadPage, /schoolQuestionId/);
  assert.doesNotMatch(uploadPage, /schoolEditionId|editionOptions|publisher|classLabels/);
  assert.doesNotMatch(uploadPage, /<details[^>]*>[\s\S]*?createCreatorSchoolNode/);
});

test("admin page exposes authenticated create, edit and delete controls", () => {
  assert.match(adminPage, /auth\.currentUser/);
  assert.match(adminPage, /save-school-node/);
  assert.match(adminPage, /delete-school-node/);
  assert.match(adminPage, /Update entry/);
  assert.match(adminPage, /Book cover image URL/);
  assert.doesNotMatch(adminPage, /Edition|Publisher|Applicable classes/);
  assert.match(adminPage, /Only admin \/ super_admin accounts/);
});

test("public catalog reads only published nodes and Explore links to Learning Library", () => {
  assert.match(route, /where\("status", "==", "published"\)/);
  assert.match(explorePage, /Book-centric Learning Library/);
  assert.doesNotMatch(explorePage, /Board → School → Class/);
});
