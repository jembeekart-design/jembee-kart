import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../route.ts", import.meta.url), "utf8");
const seed = JSON.parse(await readFile(new URL("../../../../data/learning-library/ncert-grade-6-seed.json", import.meta.url), "utf8"));
const uploadPage = await readFile(new URL("../../../videos/upload/page.tsx", import.meta.url), "utf8");
const adminPage = await readFile(new URL("../../../admin/categories/page.tsx", import.meta.url), "utf8");
const explorePage = await readFile(new URL("../../../explore/page.tsx", import.meta.url), "utf8");
const learningPage = await readFile(new URL("../../../learn/school/page.tsx", import.meta.url), "utf8");

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

test("learning catalog supports bounded parent-scoped cursor pagination", () => {
  assert.match(route, /params\.get\("type"\)/);
  assert.match(route, /params\.get\("parentId"\)/);
  assert.match(route, /Math\.min\(50, Math\.max\(1, pageSizeValue\)\)/);
  assert.match(route, /query\.startAfter\(cursorDoc\)/);
  assert.match(route, /limit\(pageSize \+ 1\)/);
  assert.match(route, /nextCursor/);
  assert.match(route, /cursorDoc\.data\(\)\?\.parentId !== parentId/);
  assert.match(route, /Invalid learning node type/);
});

test("public learning discovery requests each hierarchy level from the paginated API", () => {
  assert.match(learningPage, /types\[stage\]/);
  assert.match(learningPage, /params\.set\("parentId", parentId\)/);
  assert.match(learningPage, /params\.set\("cursor", cursor\)/);
  assert.match(learningPage, /data\.pagination\?\.hasMore/);
  assert.match(learningPage, /nextCursors/);
});

test("deep links resolve one exact published learning node without requiring a full catalog read", () => {
  assert.match(route, /params\.get\("nodeId"\)/);
  assert.match(route, /schoolLearningNodes"\)\.doc\(nodeId\)\.get\(\)/);
  assert.match(route, /doc\.data\(\)\?\.status !== "published"/);
  assert.match(route, /Published learning entry not found/);
  assert.match(uploadPage, /fetchLearningNode\(/);
  assert.match(uploadPage, /nodeId/);
});

test("large Question catalogs are fetched only for the selected Chapter in Admin", () => {
  assert.match(adminPage, /type !== "question" \|\| !parentId/);
  assert.match(adminPage, /type: "question", parentId, pageSize: "50"/);
  assert.match(adminPage, /setNodes\(\(current\) => \[\.\.\.current\.filter\(\(node\) => node\.type !== "question"\), \.\.\.questions\]\)/);
  assert.match(adminPage, /if \(active\)/);
});

test("NCERT Grade 6 starter catalog is admin-only, bounded and repeatable", () => {
  assert.match(route, /action === "seed-ncert-grade-6"/);
  assert.match(route, /verifyAdmin\(req\)/);
  assert.match(route, /action === "seed-ncert-grade-6" \? 500 : 100/);
  assert.match(route, /\{ merge: true \}/);
  assert.match(adminPage, /Add NCERT Grade 6 starter catalog/);
  assert.match(adminPage, /seed-ncert-grade-6/);
  assert.equal(seed.entries.filter((entry) => entry.type === "subject").length, 6);
  assert.equal(seed.entries.filter((entry) => entry.type === "book").length, 6);
  assert.equal(seed.entries.filter((entry) => entry.type === "chapter").length, 70);
  assert.equal(seed.entries.filter((entry) => entry.type === "question").length, 22);
  assert.ok(seed.entries.filter((entry) => entry.type === "book").every((entry) => entry.coverImageUrl.startsWith("/learning-covers/")));
  assert.ok(seed.entries.filter((entry) => entry.type === "question").every((entry) => entry.name.startsWith("Practice Q1 — ")));
});

test("NCERT Grade 6 seed is Admin-only and is available from the built-in catalog action", () => {
  assert.match(route, /action === "seed-ncert-grade-6"/);
  assert.match(route, /NCERT_GRADE_6_SEED\.entries/);
  assert.match(route, /action === "seed-ncert-grade-6" \? 500 : 100/);
  assert.match(adminPage, /Add NCERT Grade 6 starter catalog/);
  assert.match(adminPage, /9 Subjects, 9 Books, 103 Chapters और 103 original JEMBEE PLAY practice questions/);
});

test("re-importing the NCERT seed never silently republishes an Admin-unpublished entry", () => {
  assert.match(route, /existingNodeSnapshots = await Promise\.all\(normalized\.map/);
  assert.match(route, /existingNode\.exists && typeof existingStatus === "string" \? existingStatus : "published"/);
  assert.match(route, /Re-seeding must never silently re-publish/);
});
