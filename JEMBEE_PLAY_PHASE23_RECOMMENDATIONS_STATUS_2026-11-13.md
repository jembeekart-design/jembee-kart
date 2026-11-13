# JEMBEE PLAY — Phase 23: Learning Recommendations & Personalized Discovery

## Scope
- Bounded validation of learning-course metadata.
- Deterministic ranking using caller-supplied, server-authorized category interest signals.
- Exclusion of drafts, archived courses, duplicate course IDs, and already-enrolled/completed courses supplied by the caller.
- Bounded output count and deterministic tie-breaking.

## Security and product boundaries
- This phase adds pure TypeScript domain contracts and Node tests only.
- It does not collect behavioral profiles, infer sensitive traits, call an ML service, persist signals, or expose an API.
- Callers must authenticate the learner, authorize signal ownership, and provide authoritative published course records.
- No changes to Firestore collections/rules, payments, payouts, or video upload behavior.

## Verification
- Run full `.mjs` test suite and ZIP integrity validation before delivery.
- Build, TypeScript project check, lint, Firebase emulator, and production integrations are not certified by this phase.
