# Legacy School Catalog — Superseded

> This document describes the earlier Board → School → Class model. It is retained only as migration history and must not be used as the current JEMBEE PLAY product specification.

## Current canonical learning hierarchy

`Subject → Book → Chapter → Question → Matching answer videos`

- Board, School, Class, and Edition/Part are not selection steps in the current Learning Library.
- Books are grouped under Subjects and use original JEMBEE PLAY cover artwork or another authorized image.
- Chapters belong to Books; Questions belong to Chapters.
- Teachers select existing published entries and upload matching answer videos. They cannot create or edit master catalog records.
- Admin controls exceptional catalog corrections, publication status, duplicate/missing-entry cleanup, moderation, and video approval.

## Current starter data

The metadata-only Grade 6 starter catalog is maintained at `src/data/learning-library/ncert-grade-6-seed.json` and can be imported by an authenticated Admin from `/admin/categories`.

It includes 6 subjects, 6 books, 70 chapter records, and 22 independently authored practice questions, with original JEMBEE PLAY SVG book covers. It does not contain NCERT PDF scans, official cover art, verbatim textbook exercises, or answer keys.

See `docs/JEMBEE_PLAY_BOOK_CENTRIC_LEARNING_LIBRARY.md` for the current data model, import workflow, sources, and copyright restrictions.
