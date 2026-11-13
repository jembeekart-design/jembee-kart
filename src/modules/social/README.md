# Social module

This module owns pure Social-domain contracts shared by follow, comment-like and notification adapters.

## Current scope
- `contracts.ts`: validates follow identity pairs and comment-like requests; builds bounded follow-notification payloads.
- Existing Firestore transaction implementations remain in their current adapters (`src/lib/social` and `src/app/api/shorts/comment-like`) to avoid changing collection paths, transaction semantics, or client contracts during this incremental migration.

## Explicitly not migrated yet
- Likes/reactions persistence and feed aggregation
- Comment creation/moderation and comment count reconciliation
- Follow graph repository and counter reconciliation
- Notification inbox, delivery and read-state persistence
- Server-side authorization and Firestore rules integration tests

Do not treat this module boundary as proof of production readiness.
