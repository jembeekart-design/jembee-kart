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
