import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../page.tsx", import.meta.url), "utf8");
const answers = await readFile(new URL("../../../api/learning/school-video-answers/route.ts", import.meta.url), "utf8");
const moderation = await readFile(new URL("../../../api/admin/moderate-video/route.ts", import.meta.url), "utf8");

test("Learning discovery follows Subject Book Chapter Question and has level-specific search", () => {
  assert.match(page, /const types = \["subject", "book", "chapter", "question"\] as const/);
  assert.match(page, /Search books on this page/);
  assert.match(page, /Search chapters on this page/);
  assert.match(page, /Search questions on this page/);
  assert.match(page, /coverImageUrl/);
  assert.doesNotMatch(page, /edition|Board →|Choose School|Choose Class/);
});

test("Question answers require a published Question node before reading matching videos", () => {
  assert.match(answers, /collection\("schoolLearningNodes"\)\.doc\(questionId\)\.get\(\)/);
  assert.match(answers, /question\?\.type !== "question"/);
  assert.match(answers, /question\.status !== "published"/);
  assert.match(answers, /Published learning question not found/);
});

test("Question answers only return approved active safe videos and keep paid checkout gated", () => {
  assert.match(answers, /schoolQuestionId/);
  assert.match(answers, /data\.status !== "approved"/);
  assert.match(answers, /data\.active !== true/);
  assert.match(answers, /data\.moderation !== "safe"/);
  assert.match(answers, /process\.env\.SHORTS_PAID_VIDEO_CHECKOUT_ENABLED !== "true"/);
  assert.match(answers, /data\.paidCheckoutEnabled !== true/);
  assert.match(answers, /data\.paidVideoStatus !== "enabled"/);
});

test("Approved video records retain Subject Book Chapter Question metadata", () => {
  for (const field of ["schoolSubjectId", "schoolBookId", "schoolChapterId", "schoolQuestionId"]) assert.ok(moderation.includes(`${field}:`), `Missing approval field ${field}`);
});
