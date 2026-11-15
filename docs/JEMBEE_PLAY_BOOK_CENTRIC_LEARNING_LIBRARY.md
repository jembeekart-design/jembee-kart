# JEMBEE PLAY — Book-Centric Learning Library

## Canonical hierarchy

The learning catalog is organized by the identity of the learning material, not by a school's grade structure:

`Subject → Book → Edition / Part → Chapter → Question → Answer videos`

A book can be mapped to more than one applicable class using `classLabels`. Class labels are descriptive metadata only; they do not create separate copies of the book or its questions. Board and school are not required upload steps.

## Book record

Each book record must include:

- `id`: stable lowercase ID, 2–64 characters, letters/numbers/underscore/hyphen
- `type`: `book`
- `name`: official book title
- `parentId`: ID of its Subject
- `coverImageUrl`: HTTPS URL for the correct book-cover image
- `publisher`: publisher name
- `classLabels`: optional array, e.g. [`Class 7`, `Class 8`]

## Other records

- Subject: `{ id, type: "subject", name }`
- Edition / Part: `{ id, type: "edition", name, parentId: bookId }`
- Chapter: `{ id, type: "chapter", name, parentId: editionId }`; if no edition exists, `parentId` may be the book ID.
- Question: `{ id, type: "question", name, parentId: chapterId }`; `name` stores the question number and/or full question text.

IDs must be unique and stable. Parent records must be included earlier in the file or already exist in the published Learning Library. The importer accepts up to 100 records per API batch; the Admin screen automatically sends batches of 50.

## JSON import shape

The Admin Learning Library accepts either a JSON array or an object with an `entries` array. Example structure (illustrative only; replace all sample titles, IDs, and the cover URL with verified source data):

```json
{
  "entries": [
    { "id": "science", "type": "subject", "name": "Science" },
    {
      "id": "science-book-sample",
      "type": "book",
      "name": "Sample Science Book — Part 7",
      "parentId": "science",
      "coverImageUrl": "https://YOUR-HTTPS-COVER-IMAGE-URL",
      "publisher": "Publisher name",
      "classLabels": ["Class 7", "Class 8"]
    },
    { "id": "science-book-sample-ed1", "type": "edition", "name": "Part 1", "parentId": "science-book-sample" },
    { "id": "science-book-sample-ch1", "type": "chapter", "name": "Chapter 1", "parentId": "science-book-sample-ed1" },
    { "id": "science-book-sample-ch1-q1", "type": "question", "name": "Question 1 — replace with verified question text", "parentId": "science-book-sample-ch1" }
  ]
}
```

The sample is not a real textbook dataset and must not be imported as production content.

## Upload and moderation behavior

- Teachers select an existing Subject, book-cover card, optional Edition / Part, Chapter, and Question.
- The upload API revalidates the selected parent-child chain; client-provided labels alone are not trusted.
- Videos remain in the existing moderation flow. Approved answers are grouped by the same question ID.
- Only Admin / Super Admin can create, edit, delete, or bulk import master catalog records.

## Content and image rights

Only import question text and cover images that JEMBEE PLAY is authorized to reproduce (for example, open-licensed/public-domain material or content with the required permission). Verify the exact title, publisher, edition, chapter and question text before publishing. Do not represent AI-generated practice questions as verbatim textbook questions.
