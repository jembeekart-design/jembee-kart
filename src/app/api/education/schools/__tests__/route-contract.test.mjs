import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const route = readFileSync(new URL('../route.ts', import.meta.url), 'utf8');
const review = readFileSync(new URL('../review/route.ts', import.meta.url), 'utf8');
const repository = readFileSync(new URL('../../../../../../src/repositories/education/firestoreSchoolCatalog.server.ts', import.meta.url), 'utf8');
const schema = readFileSync(new URL('../../../../../../src/schemas/education/school.ts', import.meta.url), 'utf8');
const module = readFileSync(new URL('../../../../../../src/modules/education/schools.ts', import.meta.url), 'utf8');
const adminPage = readFileSync(new URL('../../../../../../src/app/admin/education/schools/page.tsx', import.meta.url), 'utf8');
const learnerPage = readFileSync(new URL('../../../../../../src/app/learn/school/page.tsx', import.meta.url), 'utf8');
test('school catalog public reads are approved-only and bounded', () => {
  assert.match(route, /collection\("educationSchools"\)\.limit\(500\)/);
  assert.match(route, /isAdmin \|\| item\.status === "approved"/);
});
test('school creation is server-admin protected, validated and duplicate-safe', () => {
  assert.match(route, /verifyMonetagAdmin\(req\)/);
  assert.match(route, /parseCreateSchool\(value\)/);
  assert.match(repository, /createHash\("sha256"\)/);
  assert.match(repository, /tx\.create\(ref/);
  assert.match(repository, /status: "pending"/);
});
test('school review is admin-only and audited', () => {
  assert.match(review, /verifyMonetagAdmin\(req\)/);
  assert.match(repository, /educationSchoolAuditLogs/);
  assert.match(review, /parseSchoolReview\(value\)/);
});
test('education route delegates to module and repository boundaries', () => {
  assert.match(route, /submitSchool\(firestoreSchoolCatalog/);
  assert.match(review, /reviewSchool\(firestoreSchoolCatalog/);
  assert.match(module, /interface SchoolCatalogRepository/);
  assert.match(schema, /export function parseCreateSchool/);
});
test('admin and learner school pages accurately disclose deferred integration', () => {
  assert.match(adminPage, /UI prototype/);
  assert.match(adminPage, /does not save or publish school records/);
  assert.doesNotMatch(adminPage, /fetch\("\/api\/education\/schools"/);

  assert.match(learnerPage, /const schools:Record<string,Item\[]>/);
  assert.match(learnerPage, /Live Firestore question-to-video mapping/);
  assert.doesNotMatch(learnerPage, /fetch\(["'`]\/api\/education\/schools/);
});
