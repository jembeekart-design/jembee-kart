# JEMBEE PLAY — Subject and Book-Based Learning Library

## Canonical hierarchy

`Subject → Book → Chapter → Question Number → Matching answer videos`

There are no Board, School, Class, or Edition / Part selection steps. Subject is a top-level grouping. Every book belongs to one Subject and has a cover image. Chapters belong directly to a Book. Teachers enter the printed Question Number themselves when uploading an answer video; Admin does not need to create a Question node for each exercise.

## Search behavior

- Subject list: search by subject name.
- Book list: search by official book name; display the book cover.
- Chapter list: search by chapter number or chapter name.
- Question Number list: automatically collect distinct question numbers from approved answer videos for the selected Chapter.
- Question answer page: show approved matching free answer videos and paid answer videos only when the global paid-checkout feature flag is enabled and an Admin has explicitly enabled that individual video. Paid videos remain hidden otherwise.

A normalized `Chapter ID + Question Number` key links teacher uploads and discovery results. Number formats such as `1`, `1(a)`, and `Q.2` are normalized for matching while the original display format is retained.

## Admin-managed records

- Subject: `{ id, type: "subject", name }`
- Book: `{ id, type: "book", name, parentId: subjectId, coverImageUrl }`
- Chapter: `{ id, type: "chapter", name, parentId: bookId }`
- Legacy Question node: optional only, for older records or separately authorized catalog content. It is not required for teacher uploads.

IDs must be unique and stable. Parent records must be included earlier in the import file or already exist in the published Learning Library. Manual JSON imports are sent in batches of 50 (API limit 100). The built-in Grade 6 seed action accepts up to 500 records in one Firestore batch and uses stable IDs with merge semantics.

## JSON import shape

The Admin Learning Library accepts either a JSON array or an object with an `entries` array. Example structure (illustrative only; replace sample names, IDs and cover URL with verified, authorized source data):

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
    { "id": "science-book-sample-ch3", "type": "chapter", "name": "Chapter 3 — Heat", "parentId": "science-book-sample" }
  ]
}
```

The sample is not a real textbook dataset and must not be imported as production content.

## Teacher upload and moderation

- Teachers select an existing Subject, book-cover card and Chapter.
- Teacher manually types the Question Number printed in the book (for example `1`, `1(a)`, or `Q.2`). The upload form does not require a pre-created Question record.
- The upload API revalidates the published Subject → Book → Chapter parent-child chain and validates the Question Number format; client-provided labels alone are not trusted.
- The Question Number and its normalized matching key are saved with the moderation submission and copied to the approved video.
- The Learning Library automatically lists Question Numbers from approved videos and groups all matching teacher answers together.
- Only Admin / Super Admin can create, edit, delete, or bulk import Subject, Book and Chapter master records. Existing legacy Question records remain supported for backward compatibility.

## Content and image rights

A Question Number is an identifier and does not require Admin to reproduce the textbook exercise wording. Do not upload or display textbook question text, page scans, answer keys or official covers unless JEMBEE PLAY has the rights required for commercial use. Independently authored prompts must be labelled `JEMBEE PLAY Practice` and must never be presented as verbatim NCERT exercise questions.

## Grade 6 starter catalog

A versioned metadata-only starter dataset is maintained at `src/data/learning-library/ncert-grade-6-seed.json`.

- Nine subjects, nine Grade 6 NCERT books, 103 chapter entries, and 103 independently authored practice prompts. The listed language tracks include English, Hindi and Sanskrit.
- Books: Poorvi, Malhar, Ganita Prakash, Curiosity, Exploring Society: India and Beyond, Deepakam, Kriti-I, Khel Yatra, and Kaushal Bodh.
- Original JEMBEE PLAY SVG cover artwork is stored under `public/learning-covers/`; these are navigation illustrations, not official NCERT covers.
- An authenticated Admin action, `seed-ncert-grade-6`, imports the complete starter catalog with stable IDs and merge semantics. Re-running it updates the same records rather than creating duplicates, and preserves an existing entry's current publication status so an Admin-unpublished entry is not silently republished.
- Existing practice prompt records remain in the seed for compatibility and are not required for Teacher Question Number entry. They are not NCERT exercise questions and do not include official answer keys.
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
