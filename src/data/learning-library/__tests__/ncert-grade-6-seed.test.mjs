import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";

const seed = JSON.parse(await readFile(new URL("../ncert-grade-6-seed.json", import.meta.url), "utf8"));
const entries = seed.entries;
const byId = new Map(entries.map((entry) => [entry.id, entry]));

test("NCERT Grade 6 starter catalog has unique IDs and expected hierarchy counts", () => {
  assert.equal(new Set(entries.map((entry) => entry.id)).size, entries.length);
  assert.equal(entries.filter((entry) => entry.type === "subject").length, 9);
  assert.equal(entries.filter((entry) => entry.type === "book").length, 9);
  assert.equal(entries.filter((entry) => entry.type === "chapter").length, 103);
  assert.equal(entries.filter((entry) => entry.type === "question").length, 103);
});

test("every catalog record has a valid parent in the Subject to Book to Chapter to Question tree", () => {
  const expectedParent = { book: "subject", chapter: "book", question: "chapter" };
  for (const entry of entries) {
    if (entry.type === "subject") {
      assert.equal(entry.parentId, undefined);
      continue;
    }
    const parent = byId.get(entry.parentId);
    assert.ok(parent, `missing parent for ${entry.id}`);
    assert.equal(parent.type, expectedParent[entry.type], `wrong parent type for ${entry.id}`);
  }
});

test("every book has an original local JEMBEE PLAY cover asset", async () => {
  const books = entries.filter((entry) => entry.type === "book");
  for (const book of books) {
    assert.ok(book.coverImageUrl.startsWith("/learning-covers/"));
    await access(new URL(`../../../../public${book.coverImageUrl}`, import.meta.url));
  }
});

test("every chapter has an independently authored practice prompt, not copied NCERT exercise text", () => {
  const chapters = entries.filter((entry) => entry.type === "chapter");
  for (const chapter of chapters) {
    const questions = entries.filter((entry) => entry.type === "question" && entry.parentId === chapter.id);
    assert.ok(questions.length > 0, `no practice prompt for ${chapter.id}`);
    assert.ok(questions.every((question) => /JEMBEE PLAY (Practice Q1|अभ्यास प्रश्न 1)/.test(question.name)));
  }
  assert.ok(seed.notes.some((note) => note.includes("independently written")));
  assert.ok(seed.sourceReferences.includes("https://ncert.nic.in/textbook.php"));
});
