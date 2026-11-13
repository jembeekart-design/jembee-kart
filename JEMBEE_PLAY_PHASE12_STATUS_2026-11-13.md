# JEMBEE PLAY — Phase 12 Teacher Application & Admin Review

Date: 2026-11-13

## Implemented
- Authenticated teacher application GET/POST route; applicant UID comes only from Firebase Admin token verification.
- Bounded application schema: display name, qualification, subjects, experience years and bio.
- Firestore repository with transaction-based pending submission and audit log.
- Admin-only pending queue and review endpoint using the existing `verifyMonetagAdmin` helper.
- Review decisions: verified, rejected (reason required), suspended; reviewer identity and audit record are server-derived.
- No teacher referral or payout calculation changed.

## Validation
- Added source-contract tests for bounds, token-derived identity, transactional pending state, audit trail, admin guard and rejection reason.
- Full dependency install, semantic TypeScript, ESLint, Next build, Firestore Emulator and production Firebase tests are not yet completed.
- Firestore composite index for `status + submittedAt` may be required; verify in staging and add index only after checking existing index config.
- New `teacherVerifications` and `teacherVerificationAuditLogs` collections are server-admin SDK only. Confirm deployed Firestore rules deny client writes before staging rollout.

## Not done
- No GitHub push, deployment, payout activation or paid-video activation.
