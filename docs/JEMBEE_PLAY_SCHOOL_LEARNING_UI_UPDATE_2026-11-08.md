# JEMBEE PLAY School Learning UI Update — 2026-11-08

## Included in this update
- Retains the Board → School → Class → Subject/Book → Chapter → Question → Video Answers navigation prototype.
- Updates the subject/book catalog labels with sample NCERT editions.
- Adds demo answer metadata: teacher/creator label, duration, language, format, and views.
- Adds Free/Paid and Hindi/English filters on the question video-answer screen.
- Keeps search and client-side pagination on the catalog selection screens.

## Important limitations
- Catalog records and answer cards are demo data only.
- No Firestore persistence, server-side pagination, student school-request submission, Admin approval workflow, or real video playback/payment is enabled by this UI update.
- Do not enable paid access, payouts, or production writes until server-side authorization, catalog mapping, Cashfree entitlement, settlement, and security tests are implemented and verified.
- School names shown in the prototype must be verified before publication.
