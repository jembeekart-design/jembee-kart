# Learning module contracts

This folder contains framework-independent validation and eligibility rules for course summaries, lesson progress, assessments, grading, and certificate eligibility.

- `contracts.ts` validates course/progress inputs and derives progress from unique authoritative lesson IDs.
- `assessment-contracts.ts` validates bounded multiple-choice assessment definitions, enforces server-counted attempt limits, grades against trusted answer keys, and evaluates certificate eligibility.

These are pure contracts, not production persistence or API handlers. Server code must authenticate the learner, load course/enrollment/assessment records from trusted storage, keep answer keys server-side, enforce transactional attempt counting and idempotency, and issue certificates through an authorized server workflow. Never trust client-submitted scores, pass flags, lesson counts, or identity claims. No certificate issuance endpoint, PDF, Firestore writes, payment entitlement, or UI is implemented here.


## Phase 22 — Learning analytics
- `analytics-contracts.ts` validates bounded learning event candidates and summarizes learner/course progress from server-authoritative, scoped records.
- Event IDs and completed lessons are deduplicated; events for other learners/courses or lessons outside the authoritative course list are ignored.
- Course aggregates deduplicate learner rows before calculating average progress and total watch time.
- These are pure contracts only: no event ingestion API, telemetry SDK, Firestore writes, dashboards, exports, or privacy/retention policy is implemented.
\n\n## Phase 23 — Recommendations\n`recommendation-contracts.ts` validates bounded published-course metadata and ranks eligible recommendations from server-authorized category signals. It excludes non-published, duplicate and explicitly excluded courses. This is a deterministic domain primitive only: no profile tracking, recommender API, Firestore writes, model training, or client personalization is implemented. Callers must authorize signal ownership and candidate visibility before invoking it.\n
\n## Phase 24 — Curriculum administration
- `curriculum-contracts.ts` validates bounded curriculum/module/lesson trees, unique IDs and ordering positions, content types and duration bounds.
- Publishing eligibility requires at least one published lesson per module; archived curricula cannot be republished through the status transition contract.
- Reordering accepts only a complete permutation of known IDs.
- These are domain contracts only: no admin UI, API, Firestore persistence, audit log, media upload, or revision workflow is implemented. Server callers must authorize editors and apply changes transactionally.

\n## Phase 25 — Teacher course creation and publishing
- `teacher-publishing-contracts.ts` validates teacher-owned course drafts, verified-teacher submission eligibility, separate teacher/reviewer transitions, exact-revision approval before publication, monotonic revision increments, and ownership comparisons.
- This is domain logic only: no teacher course editor UI, review queue UI, APIs, Firestore persistence, reviewer RBAC integration, audit log, or publishing transaction is implemented. Server code must derive teacher identity from verified authentication, enforce roles, use transactional revision checks, and write audit records.

\n## Phase 26 — Course pricing, access and enrollment
- `pricing-access-contracts.ts` validates free/paid course prices in integer minor units, enrollment offer eligibility, free and paid access, server-verified order activation, entitlement expiry/revocation, and learner-course enrollment keys.
- These are policy contracts only: no Cashfree integration, payment webhook, Firestore transaction, refund handler, enrollment API, checkout UI, tax/invoice logic, or entitlement persistence is implemented. Payment verification must be performed from authenticated provider webhook/order reconciliation on the server; never trust client payment status.

\n## Phase 27 — Revenue ledger and settlement policy
- `revenue-ledger-contracts.ts` allocates only verified, reconciled eligible ad revenue using Creator 30%, Sharer 20%, Platform 50% after refunds, chargebacks, and provider fees; calculates teacher referral at 2% of verified platform net profit on eligible paid-course revenue; and defines idempotent append/reversal and fail-closed payout gates.
- This is arithmetic/policy logic only: no Firestore ledger, payment-provider reconciliation, creator/sharer attribution, tax computation, wallet, settlement job, payout provider, or live transfer is implemented. Historical ledger entries should be append-only with compensating reversals. Never enable live payouts until persistence, reconciliation, idempotency, compliance, and tests are verified and explicit approval is obtained.


## Phase 28 — Creator and teacher earnings dashboard read model
- `earnings-dashboard-contracts.ts` builds a bounded authenticated-owner-scoped read model from trusted server-loaded, verified and reconciled ledger rows; deduplicates entry IDs; applies date/row limits; separates currencies and status buckets; and omits owner IDs from individual output rows.
- Creator, sharer and teacher rows are restricted to their corresponding earning types. Reversal rows remain visible as signed ledger adjustments; historical entries are not overwritten.
- `eligible` is a ledger status only, not a promise that funds are payable or withdrawable. No payout action, wallet balance, or transfer is exposed.
- Domain contract only: no dashboard UI, API, Firestore query/index, authentication middleware, role authorization, or ledger persistence is implemented. Server callers must derive the authenticated user from a verified session and load only authorized ledger records from trusted storage.


## Phase 29 — Earnings API authentication and fail-closed access
- `earnings-access-contracts.ts` validates bounded Bearer token extraction, narrow creator/sharer/verified-teacher access grants, and self-only identity constraints.
- `src/app/api/creator/earnings/route.ts` verifies Firebase ID tokens with revocation checking and returns `503 EARNINGS_LEDGER_NOT_CONFIGURED` until a canonical reconciled-ledger repository/schema is explicitly integrated.
- The endpoint uses `no-store` and deliberately does not substitute raw Monetag earnings/payment collections for the settlement ledger.
- This is a secure API boundary scaffold, not a functioning earnings-history endpoint. No Firestore ledger schema, query, indexes, role-document integration, UI, payout, or transfer is implemented. Do not present earnings as payable or enable live payouts.


## Phase 30 — Canonical settlement ledger schema design
- `canonical-ledger-schema.ts` defines a versioned server-only record contract, validates bounded fields and integer minor-unit money, enforces role/earning-type pairing and linked reversals, and checks immutable-history mutation rules.
- `docs/PHASE_30_CANONICAL_LEDGER_SCHEMA_DESIGN.md` inventories relevant legacy collection names and sets out a no-destructive-migration approval checklist.
- No Firestore rules, indexes, collection contents, or production schema were changed. Existing client-deny rules remain untouched. No migration, payout, or transfer was performed.


## Phase 31 — Legacy earnings data audit and read-only mapping
- `legacy-earnings-inventory.ts` classifies observed money-related collections by domain, source evidence and safe migration disposition.
- `docs/PHASE_31_LEGACY_EARNINGS_READ_ONLY_AUDIT.md` documents observed fields and writers/readers, including a correction: `shortsSettlementLedger` is already used by paid-video routes and Phase 30's schema is only a proposed normalized target, not the current schema.
- Monetag USD import/earnings/payment records, paid-video INR settlement, payment orders/events, purchases, verified expenses, referral attribution and older creator earnings are separate domains. No automatic merge is safe.
- Static audit only: no production Firestore access, database mutation, migration, backfill, collection rename/delete, or payout.
