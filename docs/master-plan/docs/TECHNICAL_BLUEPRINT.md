# Technical Blueprint

## 1. Existing systems to preserve
- Firebase project: `jembee-kart1`.
- Existing Firestore collection: `watchEarnVideos` and its historical documents.
- Existing Google Drive moderation folder and file IDs.
- Existing video moderation state and paid playback entitlement checks.
- Existing Next.js app and authentication unless audit proves a change is required.

Do not assume every Drive file is public/approved merely because it is in the moderation folder. Resolve Drive file IDs through Firestore records and verify moderation + active state before playback.

## 2. Google Drive access
- Use the Firebase service-account JSON already configured for server-side Google APIs only after confirming Drive API enabled and folder shared to that service-account email with Viewer permission.
- Use `drive.readonly` for playback/listing where possible. Upload workflows need a separate narrowly scoped write permission and must be reviewed independently.
- Keep service-account credentials server-only. Never expose them to browser bundles, logs, client responses, or ZIPs.
- Migrate stream and thumbnail server routes to the shared Drive client only after tests. Keep byte-range streaming, MIME/size checks, folder-membership validation, and paid access checks.
- Remove/disable OAuth fallback only after verifying no other upload or production route depends on it. Do not delete OAuth code or secrets blindly.

## 3. Proposed Firestore collections (adapt to existing conventions)
- `contentCategories/{categoryId}`: name, slug, icon, image, order, enabled, parentId, agePolicy, createdAt, updatedAt.
- `schools/{schoolId}`: normalizedName, displayName, address/region, board, officialIdentifiers, verificationStatus, aliases, createdAt, updatedAt.
- `schoolClaims/{claimId}`: schoolId, requesterId, evidence metadata, status, reviewerId, audit timestamps.
- `educationClasses/{classId}`: label, normalizedLabel, stage, sortOrder.
- `curricula/{curriculumId}`: board, region, language, version.
- `books/{bookId}`: title, classId, subjectId, board/curriculum, publisher, edition, year, language, ISBN/catalogue metadata, rightsStatus.
- `subjects/{subjectId}`: name, slug, language.
- `chapters/{chapterId}`: bookId, title, chapterNumber, sortOrder, language.
- `questions/{questionId}`: chapterId, questionNumber, prompt, type, difficulty, language, pageReference, mediaRefs, rightsStatus.
- `creatorProfiles/{creatorId}`: userId, displayName, bio, languages, subjects, verificationStatus, linkedSchoolIds, profileMedia.
- `schoolTeachers/{associationId}`: schoolId, creatorId, role/title, verificationStatus, evidenceRef.
- `learningContentLinks/{linkId}`: videoId, categoryId, schoolId?, classId?, bookId?, subjectId?, chapterId?, questionIds[], creatorId, language, freePaid, priceRef, status.
- `watchEarnVideos/{videoId}`: preserve existing fields; add compatible optional metadata only after migration design and rules review.
- `videoEntitlements/{entitlementId}` or existing purchase collection: server-verified user/video entitlement and transaction reference.
- `adPlacements/{placementId}`: enabled, provider, placementKey, allowedCategories, frequencyCap, excludedContentTypes, agePolicy.
- `moderationReports/{reportId}`, `auditLogs/{logId}`, `learningProgress/{progressId}`, `savedContent/{savedId}`, `questionAttempts/{attemptId}`.

Use stable IDs and references, not school/book names as document IDs. Normalize names for duplicate detection, but require admin review before merging records. Use transactions or server-side uniqueness checks for canonical catalogue creation.

## 4. API/service boundaries (proposed)
- `GET /api/categories` — enabled category tree.
- `GET /api/search?q=` — permission-aware global search.
- `GET /api/schools?query=` and `GET /api/schools/:id`.
- `GET /api/schools/:id/teachers`.
- `GET /api/learning/books`, `/chapters`, `/questions` with validated filters.
- `POST /api/schools/suggest` — request new school, not immediate public creation.
- `POST /api/learning/content-links` — creator links existing video to catalogue entities.
- Existing video stream/thumbnail routes remain server-side and enforce all existing gates.
- Admin routes for category/catalogue moderation, school verification, teacher verification, and ad configuration.

## 5. Security rules
- Firestore client rules deny writes to protected catalogue, moderation, entitlement, and payout records unless role-appropriate.
- Use server-side Admin SDK for sensitive mutations with explicit role checks and audit logs.
- Validate all IDs, ownership, status, price, and file metadata server-side.
- Never trust client-provided `approved`, `active`, `isPaid`, `price`, `role`, or purchase flags.
- Paid stream: verify authenticated user + confirmed entitlement before any bytes are sent. Unknown/payment-pending/refunded states deny access.
- Rate-limit upload, comments, search abuse, school suggestions, and reports.
- Sanitize text; validate uploads; protect against SSRF/path traversal and arbitrary Drive file access.

## 6. Migration approach
1. Export/backup Firestore schema and rules; do not change production data.
2. Inventory existing `watchEarnVideos` records and Drive IDs.
3. Build a read-only mapping report: existing videos → candidate category/school/book/chapter/question.
4. Add new collections and indexes without modifying old documents.
5. Backfill optional metadata in batches with dry-run, audit output, and rollback plan.
6. Keep legacy feed operational during transition.
7. Switch read path behind a feature flag; compare counts and access outcomes.
8. Remove legacy path only after acceptance and rollback window.

## 7. Test matrix
- Drive list/get/download: service account, folder membership, missing file, trashed file, revoked permission, quota/API error.
- Streaming: range request, invalid range, large file chunking, MIME mismatch, missing Drive ID.
- Moderation: pending/rejected/inactive/unsafe content never public.
- Paid: no login, no purchase, pending payment, failed payment, refunded payment, valid entitlement, expired token.
- Search: Hindi/English, aliases, duplicate schools, no unauthorized or rejected content.
- Role tests: learner, guardian, teacher, school admin, moderator, super admin.
- UI: mobile touch, low-memory Android, Android TV D-pad/focus, reduced motion, screen reader.
- Ads: provider blocked, script error, frequency cap, paid content exclusion, child account exclusion.

## 8. Environment and secret handling
- `.env.local` stays local and gitignored.
- Never commit Firebase Admin JSON, private keys, OAuth refresh tokens, or Monetag private configuration.
- Validate required environment variables without printing their values.
- Use deployment secret manager for production credentials.
