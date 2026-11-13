import { test } from "node:test";
import assert from "node:assert/strict";
import { validateLearningEvent, summarizeLearnerProgress, summarizeCoursePerformance } from "../analytics-contracts.ts";
const event = (patch = {}) => ({ eventId: "e1", learnerId: "u1", courseId: "c1", lessonId: "l1", type: "lesson_completed", durationSeconds: 120, occurredAt: 1000, ...patch });
test("validates bounded server learning events", () => {
  assert.equal(validateLearningEvent(event()).ok, true);
  assert.equal(validateLearningEvent(event({ durationSeconds: 86401 })).ok, false);
  assert.equal(validateLearningEvent(event({ type: "payment" })).ok, false);
  assert.equal(validateLearningEvent(event({ lessonId: "../x" })).ok, false);
  assert.equal(validateLearningEvent(event({ occurredAt: -1 })).ok, false);
});
test("summarizes only scoped events and authoritative lessons", () => {
  const rows = [event(), event({ eventId: "e2", lessonId: "l2", type: "lesson_started", durationSeconds: 60 }), event({ eventId: "e3", learnerId: "u2" }), event({ eventId: "e4", lessonId: "unknown" })];
  const result = summarizeLearnerProgress(rows, "u1", "c1", ["l1", "l2"]);
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.value, { startedLessons: 1, completedLessons: 1, totalLessons: 2, progressPercent: 50, watchSeconds: 180 });
});
test("deduplicates repeated event IDs and completed lesson IDs", () => {
  const result = summarizeLearnerProgress([event(), event(), event({ eventId: "e2" })], "u1", "c1", ["l1", "l2"]);
  assert.equal(result.ok, true);
  if (result.ok) { assert.equal(result.value.completedLessons, 1); assert.equal(result.value.watchSeconds, 240); }
});
test("rejects invalid scope and excessive event volume", () => {
  assert.equal(summarizeLearnerProgress([], "../u", "c1", []).ok, false);
  assert.equal(summarizeLearnerProgress(Array(5001).fill(event()), "u1", "c1", ["l1"]).ok, false);
});
test("summarizes unique learner course performance", () => {
  const result = summarizeCoursePerformance([{ learnerId: "u1", progressPercent: 50, watchSeconds: 100 }, { learnerId: "u2", progressPercent: 100, watchSeconds: 200 }, { learnerId: "u1", progressPercent: 90, watchSeconds: 900 }]);
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.value, { learners: 2, averageProgressPercent: 95, totalWatchSeconds: 1100 });
});
test("rejects invalid aggregate metrics", () => {
  assert.equal(summarizeCoursePerformance([{ learnerId: "u1", progressPercent: 101, watchSeconds: 10 }]).ok, false);
});
