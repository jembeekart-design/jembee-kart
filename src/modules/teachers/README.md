# Teachers module

Teacher verification is deliberately separate from creator identity/profile state.

- `not_submitted` / `pending` / `rejected` / `verified` / `suspended` are explicit states.
- Creator profile visibility must never imply teacher verification.
- Referral eligibility must require an explicitly verified teacher and the existing referral ownership/settlement checks.
- This module contains pure domain rules only; persistence and admin authorization must be added through audited server routes in a later step.
- No Firestore collection names, existing referral records, or payout rules are changed here.

## Application workflow (Phase 12)
- `POST /api/teachers/verification` accepts bounded application details; applicant UID is derived from a verified Firebase ID token, never request JSON.
- `GET /api/teachers/verification` returns only the authenticated applicant's own application.
- `GET/POST /api/admin/teachers/verification` is guarded by the existing server-side admin verifier; it lists pending applications and records verified/rejected/suspended decisions.
- Firestore persistence uses `teacherVerifications` and `teacherVerificationAuditLogs` through the Admin SDK repository. Client writes must remain denied by Firestore rules.
- Add/verify the `status + submittedAt` composite index in staging before enabling the admin queue.
