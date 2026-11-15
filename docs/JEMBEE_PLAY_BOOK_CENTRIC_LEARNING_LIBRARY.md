# JEMBEE PLAY — Subject and Book-Based Learning Library

## Canonical hierarchy

`Subject → Book → Chapter → Question → Matching answer videos`

There are no Board, School, Class, or Edition / Part selection steps. Subject is a top-level grouping. Every book belongs to one Subject and has a cover image. Chapters belong directly to a Book. Questions belong directly to a Chapter.

## Search behavior

- Subject list: search by subject name.
- Book list: search by official book name; display the book cover.
- Chapter list: search by chapter number or chapter name.
- Question list: search by question number or question text.
- Question answer page: show all approved matching free and paid answer videos from different teachers together.

The same stable question ID links teacher uploads and discovery results.

## Records

- Subject: `{ id, type: "subject", name }`
- Book: `{ id, type: "book", name, parentId: subjectId, coverImageUrl }`
- Chapter: `{ id, type: "chapter", name, parentId: bookId }`
- Question: `{ id, type: "question", name, parentId: chapterId }`

The question `name` stores the question number and/or complete authorized question text. Chapter `name` stores the chapter number and title, for example `Chapter 3 — Heat`.

IDs must be unique and stable. Parent records must be included earlier in the import file or already exist in the published Learning Library. The importer accepts up to 100 records per API batch; the Admin screen automatically sends batches of 50 in parent-first order.

## JSON import shape

The Admin Learning Library accepts either a JSON array or an object with an `entries` array. Example structure (illustrative only; replace sample names, IDs, question text and cover URL with verified, authorized source data):

```json
{
  "entries": [
    { "id": "science", "type": "subject", "name": "Science" },
    {
      "id": "science-book-sample",
      "type": "book",
      "name": "Sample Science Book",
      "parentId": "science",
      "coverImageUrl": "https://YOUR-HTTPS-COVER-IMAGE-URL"
    },
    { "id": "science-book-sample-ch3", "type": "chapter", "name": "Chapter 3 — Heat", "parentId": "science-book-sample" },
    { "id": "science-book-sample-ch3-q1", "type": "question", "name": "Q1 — replace with verified question number and text", "parentId": "science-book-sample-ch3" }
  ]
}
```

The sample is not a real textbook dataset and must not be imported as production content.

## Upload and moderation

- Teachers select an existing Subject, book-cover card, Chapter and Question.
- The upload API revalidates the full parent-child chain; client-provided labels alone are not trusted.
- Videos remain in the existing moderation flow. Approved answers are grouped by the same question ID.
- Only Admin / Super Admin can create, edit, delete, or bulk import master catalog records.

## Content and image rights

Only import question text and cover images that JEMBEE PLAY is authorized to reproduce (for example, open-licensed/public-domain material or content with the required permission). Verify the exact title, cover, chapter and question text before publishing. Do not represent AI-generated practice questions as verbatim textbook questions.

## Grade 6 starter catalog

A versioned metadata-only starter dataset is maintained at `src/data/learning-library/ncert-grade-6-seed.json`.

- Six subjects, six Grade 6 books, 70 chapter entries, and 22 independently authored practice prompts.
- The six starter books are Poorvi, Malhar, Ganita Prakash, Curiosity, Exploring Society: India and Beyond, and Deepakam.
- Original Jembee Play SVG cover artwork is stored under `public/learning-covers/`.
- An authenticated Admin action, `seed-ncert-grade-6`, imports the complete starter catalog with stable IDs and merge semantics. Re-running it updates the same records rather than creating duplicates.
- The first seed is metadata only. It does not import NCERT scans, official cover artwork, textbook exercise questions, answer keys, or PDFs. The 22 practice prompts are original JEMBEE PLAY questions and are clearly labelled as practice questions.
- Source chapter/title metadata is cross-checked against the NCERT textbook catalogue and Grade 6 book index. The official NCERT portal states that its textbooks are copyrighted and prohibits republication, redistribution, commercial packaging and hosting without permission. JEMBEE PLAY must therefore link to official NCERT resources only where permitted and must obtain written permission before hosting or monetizing NCERT e-content.

References:
- NCERT textbook portal and copyright notice: https://ncert.nic.in/textbook.php
- Grade 6 book index: https://ncert.philoid.app/class/6
- Poorvi: https://ncert.philoid.app/book/fepr1
- Malhar: https://ncert.philoid.app/book/fhml1
- Ganita Prakash: https://ncert.philoid.app/book/fegp1
- Curiosity: https://ncert.philoid.app/book/fecu1
- Exploring Society: https://ncert.philoid.app/book/fees1
- Deepakam: https://ncert.philoid.app/book/fsde1
