import { test } from "node:test";
import assert from "node:assert/strict";
import { validateLearningCandidate, rankLearningRecommendations } from "../recommendation-contracts.ts";

const course = (courseId, categoryIds = ["math"], status = "published") => ({
  courseId, title: `Course ${courseId}`, status, categoryIds, level: "beginner", lessonCount: 8,
});

test("validates bounded course recommendation metadata", () => {
  assert.equal(validateLearningCandidate(course("c1")).ok, true);
  assert.equal(validateLearningCandidate(course("../bad")).ok, false);
  assert.equal(validateLearningCandidate({ ...course("c1"), title: " " }).ok, false);
  assert.equal(validateLearningCandidate({ ...course("c1"), lessonCount: 0 }).ok, false);
  assert.equal(validateLearningCandidate({ ...course("c1"), categoryIds: Array(21).fill("math") }).ok, false);
});

test("ranks published courses by authorized category signals deterministically", () => {
  const result = rankLearningRecommendations(
    [course("c2", ["science"]), course("c1", ["math"]), course("c3", ["math"])],
    [{ categoryId: "math", weight: 2 }, { categoryId: "science", weight: 1 }],
  );
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.value.map((x) => x.courseId), ["c1", "c3", "c2"]);
});

test("excludes drafts, archived, already enrolled and duplicate course IDs", () => {
  const result = rankLearningRecommendations(
    [course("c1"), course("c1"), course("c2", ["math"], "draft"), course("c3", ["math"], "archived"), course("c4")],
    [{ categoryId: "math", weight: 1 }],
    { excludedCourseIds: ["c4"] },
  );
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.value.map((x) => x.courseId), ["c1"]);
});

test("validates signal weights and result limits", () => {
  assert.equal(rankLearningRecommendations([course("c1")], [{ categoryId: "math", weight: 11 }]).ok, false);
  assert.equal(rankLearningRecommendations([course("c1")], [], { limit: 0 }).ok, false);
});

test("preferred level is only a tie-break bonus and results are bounded", () => {
  const result = rankLearningRecommendations(
    [course("c2", ["math"]), { ...course("c1", ["math"]), level: "intermediate" }],
    [{ categoryId: "math", weight: 2 }],
    { preferredLevel: "beginner", limit: 1 },
  );
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.value.map((x) => x.courseId), ["c2"]);
});

test("returns an empty list when there are no eligible courses", () => {
  const result = rankLearningRecommendations([course("c1", ["math"], "draft")], []);
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.value, []);
});
