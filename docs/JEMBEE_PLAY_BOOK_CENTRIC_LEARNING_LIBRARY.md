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

The question `name` stores a question number and/or question text that JEMBEE PLAY is authorized to reproduce. Independently authored practice prompts must be labelled `JEMBEE PLAY Practice` and must never be presented as verbatim NCERT exercise questions. Chapter `name` stores the chapter number and title, for example `Chapter 3 — Heat`.

IDs must be unique and stable. Parent records must be included earlier in the import file or already exist in the published Learning Library. Manual JSON imports are sent in batches of 50 (API limit 100). The built-in Grade 6 seed action accepts up to 500 records in one Firestore batch and uses stable IDs with merge semantics.

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

- Nine subjects, nine Grade 6 English-medium books, 103 chapter entries, and 103 independently authored practice prompts.
- Books: Poorvi, Malhar, Ganita Prakash, Curiosity, Exploring Society: India and Beyond, Deepakam, Kriti-I, Khel Yatra, and Kaushal Bodh.
- Original JEMBEE PLAY SVG cover artwork is stored under `public/learning-covers/`; these are navigation illustrations, not official NCERT covers.
- An authenticated Admin action, `seed-ncert-grade-6`, imports the complete starter catalog with stable IDs and merge semantics. Re-running it updates the same records rather than creating duplicates.
- Every chapter in this starter dataset has one independently written practice prompt. These prompts are not NCERT exercise questions and do not include official answer keys.
- The dataset includes chapter/book metadata checked against NCERT's published catalogue and CIET / textbook references. Verify each title and revision against the current official book before publishing changes.
- NCERT states its textbooks are copyrighted and prohibits republication, redistribution, inclusion in digital content packages/software and hosting without permission. Do not download and rehost NCERT PDFs, scans, pages, exercise text or official covers. Any permitted links to NCERT resources must comply with NCERT's terms and any written permission requirement.

References:
- NCERT textbook portal and copyright notice: https://ncert.nic.in/textbook.php
- NCERT publications catalogue: https://ncert.nic.in/division/pd/pdf/list_of_publication.pdf
- Grade 6 book index: https://ncert.philoid.app/class/6
- Poorvi: https://ncert.philoid.app/book/fepr1
- Malhar: https://ncert.philoid.app/book/fhml1
- Ganita Prakash: https://ncert.philoid.app/book/fegp1
- Curiosity: https://ncert.philoid.app/book/fecu1
- Exploring Society: https://ncert.philoid.app/book/fees1
- Deepakam: https://ncert.philoid.app/book/fsde1
- Kriti-I: https://ncert.philoid.app/book/fekr1
- Khel Yatra: https://ncert.philoid.app/book/feky1
- Kaushal Bodh: https://ncert.nic.in/textbook/pdf/fekb1ps.pdf
