import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../route.ts", import.meta.url), "utf8");
const uploadPage = await readFile(new URL("../../../videos/upload/page.tsx", import.meta.url), "utf8");
const adminPage = await readFile(new URL("../../../admin/categories/page.tsx", import.meta.url), "utf8");
const explorePage = await readFile(new URL("../../../explore/page.tsx", import.meta.url), "utf8");

test("school master catalog writes require a verified admin or super_admin", () => {
  assert.match(route, /getAdminAuth\(\)\.verifyIdToken\(header\.slice\(7\)\.trim\(\), true\)/);
  assert.match(route, /role !== "admin" && role !== "super_admin"/);
  assert.match(route, /action === "save-school-node" \|\| action === "delete-school-node"/);
  assert.match(route, /managedBy: "admin"/);
});

test("master catalog validates hierarchy and prevents deleting a parent with children", () => {
  assert.match(route, /PARENT_TYPE/);
  assert.match(route, /allowedParentTypes/);
  assert.match(route, /where\("parentId", "==", id\)/);
  assert.match(route, /!children\.empty/);
});

test("teachers can select the master catalog but cannot create school nodes from upload", () => {
  assert.match(uploadPage, /Teachers केवल approved master entries चुन सकते हैं/);
  assert.doesNotMatch(uploadPage, /<details[^>]*>[\s\S]*?createCreatorSchoolNode/);
  assert.match(uploadPage, /schoolQuestionId/);
});

test("admin page exposes authenticated create, edit and delete controls", () => {
  assert.match(adminPage, /auth\.currentUser/);
  assert.match(adminPage, /save-school-node/);
  assert.match(adminPage, /delete-school-node/);
  assert.match(adminPage, /Update entry/);
  assert.match(adminPage, /Only admin \/ super_admin accounts/);
});

test("public catalog reads only published nodes and Explore continues using the published catalog", () => {
  assert.match(route, /where\("status", "==", "published"\)/);
  assert.match(explorePage, /teacher \/ uploader/);
});
