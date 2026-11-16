import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../route.ts", import.meta.url), "utf8");

test("learning answer API validates question ID and published question node", () => {
  assert.match(route, /Valid question is required/);
  assert.match(route, /loadPublishedNode\(questionId, \["question"\]\)/);
});

test("learning answer API requires every ancestor to remain published", () => {
  for (const type of ["chapter", "subject", "book", "class", "school", "board"]) {
    assert.match(route, new RegExp(`loadPublishedNode\\([^\\n]+\\["${type}"${type === "subject" ? ', "book"' : ""}\\]\\)`));
  }
  assert.match(route, /question\.data\.parentId !== chapter\.id/);
  assert.match(route, /chapter\.data\.parentId !== subjectOrBook\.id/);
  assert.match(route, /school\.data\.parentId !== board\.id/);
});

test("only approved active safe videos are returned for a published learning path", () => {
  assert.match(route, /data\.status !== "approved"/);
  assert.match(route, /data\.active !== true/);
  assert.match(route, /data\.moderation !== "safe"/);
  assert.match(route, /where\("schoolQuestionId", "==", questionId\)/);
});
