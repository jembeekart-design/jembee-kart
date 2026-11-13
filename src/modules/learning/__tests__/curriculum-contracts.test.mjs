import { test } from "node:test";
import assert from "node:assert/strict";
import { validateCurriculum, canPublishCurriculum, canTransitionCurriculumStatus, validateCurriculumOrder } from "../curriculum-contracts.ts";

const lesson = (lessonId, position, status = "published") => ({ lessonId, title: `Lesson ${lessonId}`, status, position, contentType: "video", durationSeconds: 120 });
const sample = { curriculumId: "curr_1", courseId: "course_1", title: "Math", status: "draft", modules: [
  { moduleId: "m2", title: "Second", position: 1, lessons: [lesson("l2", 1), lesson("l1", 0)] },
  { moduleId: "m1", title: "First", position: 0, lessons: [lesson("l3", 0)] },
] };

test("validates curriculum tree and normalizes ordering", () => {
  const result = validateCurriculum(sample);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.value.modules.map(m => m.moduleId), ["m1", "m2"]);
    assert.deepEqual(result.value.modules[1].lessons.map(l => l.lessonId), ["l1", "l2"]);
  }
});
test("rejects invalid IDs, empty modules, invalid content types and unsafe durations", () => {
  assert.equal(validateCurriculum(null).ok, false);
  assert.equal(validateCurriculum({ ...sample, curriculumId: "../bad" }).ok, false);
  assert.equal(validateCurriculum({ ...sample, modules: [] }).ok, false);
  assert.equal(validateCurriculum({ ...sample, modules: [{ ...sample.modules[0], lessons: [{ ...lesson("x", 0), contentType: "html" }] }] }).ok, false);
  assert.equal(validateCurriculum({ ...sample, modules: [{ ...sample.modules[0], lessons: [{ ...lesson("x", 0), durationSeconds: 90000 }] }] }).ok, false);
});
test("rejects duplicate module and lesson IDs or positions", () => {
  assert.equal(validateCurriculum({ ...sample, modules: [sample.modules[0], { ...sample.modules[1], moduleId: "m2" }] }).ok, false);
  assert.equal(validateCurriculum({ ...sample, modules: [{ ...sample.modules[0], lessons: [lesson("x", 0), lesson("x", 1)] }] }).ok, false);
  assert.equal(validateCurriculum({ ...sample, modules: [{ ...sample.modules[0], lessons: [lesson("x", 0), lesson("y", 0)] }] }).ok, false);
});
test("publishing requires each module to contain a published lesson", () => {
  const valid = validateCurriculum(sample);
  assert.equal(valid.ok && canPublishCurriculum(valid.value), true);
  const draftOnly = validateCurriculum({ ...sample, modules: [{ ...sample.modules[0], lessons: [lesson("x", 0, "draft")] }] });
  assert.equal(draftOnly.ok && canPublishCurriculum(draftOnly.value), false);
});
test("archived curriculum cannot be republished and status transitions are explicit", () => {
  assert.equal(canTransitionCurriculumStatus("draft", "published"), true);
  assert.equal(canTransitionCurriculumStatus("published", "draft"), true);
  assert.equal(canTransitionCurriculumStatus("archived", "published"), false);
  assert.equal(canTransitionCurriculumStatus("archived", "archived"), true);
});
test("reordering requires a complete permutation of existing IDs", () => {
  assert.deepEqual(validateCurriculumOrder(["a", "b"], ["b", "a"]), { ok: true, value: ["b", "a"] });
  assert.equal(validateCurriculumOrder(["a", "b"], ["a", "a"]).ok, false);
  assert.equal(validateCurriculumOrder(["a", "b"], ["a", "c"]).ok, false);
  assert.equal(validateCurriculumOrder(["a", "b"], ["a"]).ok, false);
});
