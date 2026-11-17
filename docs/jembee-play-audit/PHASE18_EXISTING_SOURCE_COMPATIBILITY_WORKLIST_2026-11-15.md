# Phase 18 — Existing Source Compatibility & Implementation Worklist

**Date:** 15 November 2026  
**Applies to:** additive work on `phase18-follow-video-rating-notifications-2026-11-15`  
**Authority:** approved 40-phase JEMBEE PLAY Enterprise Master Plan and the Phase 18 notification specification in this branch.

## Verified existing source

The following source was inspected on `main` before planning implementation:

- `src/lib/social/followService.ts`: follow/unfollow uses paired documents at `users/{targetUid}/followers/{followerUid}` and `users/{followerUid}/following/{targetUid}`. It currently sends a creator-facing follow notification after the transaction. Notification failure is intentionally swallowed so a successful follow remains successful.
- `src/lib/social/notificationService.ts`: creates a legacy `notifications` document with a timestamp-derived ID and a `follow` event.
- `src/modules/communication/contracts.ts`: already defines provider-neutral channels `in_app | email | whatsapp`, priorities, bounded message validation, email/E.164 validation, WhatsApp request-boolean consent check, and deterministic recipient/channel/event idempotency key helper.
- `src/app/api/shorts/notifications/create-like/route.ts` and `create-comment/route.ts`: server-side authenticated routes create creator-facing in-app notifications in `shorts_notifications`, with transaction-based duplicate protection and unread metadata.
- `src/firestore/collections/firestorePaths.ts`: existing paths include `shorts_notifications`, `shorts_notification_meta`, and `shorts_notification_preferences`.
- `firestore.rules`: existing Shorts notification collections are server-only (client read/write denied); user follow edges have specific access rules.
- `src/lib/admin-config/types.ts` and `defaults.ts`: notification config currently contains only FCM/push booleans and a default title; it does not yet model email/WhatsApp providers or per-user channel/category preferences.
- `JEMBEE_PLAY_PHASE18_COMMUNICATION_STATUS_2026-11-13.md`: confirms no email, WhatsApp Business API or push provider is connected; no durable consent ledger, template approval, delivery queue/retry/dead-letter, delivery webhooks, bounce handling, or communication admin console exists.

## Important security correction

The existing communication contract's `whatsappConsent: true` is only a payload validation check. It is not durable evidence of user consent. Production dispatch MUST additionally read a server-owned consent record and verify purpose, channel, status, timestamp, consent text/version and opt-out state immediately before sending. Do not treat the current boolean as sufficient.

## Existing data compatibility rules

- Preserve the legacy `notifications` collection and existing follow notification behavior.
- Preserve `shorts_notifications`, `shorts_notification_meta`, existing mark-read APIs, and unread-count semantics.
- Do not migrate or rename existing collections as part of Phase 18.
- New event/outbox/delivery/consent records must use new, namespaced collections and server-only writes.
- Never write email addresses or phone numbers into public creator/follower notification documents.
- Do not change existing follow/unfollow transaction paths or user counters solely to add external notifications.

## Required implementation tasks, in dependency order

### A. Schema and pure contracts
- Define versioned event types: `VIDEO_PUBLISHED`, `RATING_RECEIVED`, `REVIEW_RECEIVED`.
- Define category preferences per channel (video updates, ratings/reviews, account/security).
- Define durable consent records with user ID, channel, purpose, status, consent version, source, timestamp, opt-out timestamp and audit metadata.
- Define outbox event and delivery attempt contracts with stable IDs, bounded payloads, state transitions, retry count, next-attempt time and provider message ID.
- Add pure tests for invalid state transitions, recipient/channel idempotency, opt-out precedence, and missing consent.

### B. Video publication event
- Locate the authoritative moderation approval/publication transition for creator videos.
- Emit one durable `VIDEO_PUBLISHED` outbox event only after the video is approved, active, public and actually published.
- Do not trigger on upload completion, draft save, submission, pending review, or moderation approval if publication is still inactive/private.
- Resolve followers from the existing follower edge collection in bounded pages.
- Before each dispatch, re-check follow state, block state, user status, preferences, contact verification and consent.
- Use the canonical public watch route after confirming route ownership; do not hardcode a guessed route.
- A paid video can be announced as paid but must not grant an entitlement.

### C. Rating/review event
- First locate the authoritative rating/review persistence endpoint and schema. The 12 November traceability report did not establish a complete production rating/review lifecycle.
- Only emit events after server-authoritative validation and successful persistence.
- Require the product-approved eligibility rule (e.g. verified learner/purchase/attendance) before rating acceptance; do not invent eligibility.
- Exclude self-ratings, pending/rejected reviews, spam and duplicate submissions.
- Avoid exposing reviewer contact details or private profile fields.

### D. In-app delivery
- Reuse the current notification center and read/unread model where event types fit.
- Where a new document shape is needed, add it compatibly and update readers/tests together.
- Preserve existing like/comment/follow notifications.

### E. Email and WhatsApp delivery
- Add provider interfaces only after provider selection and environment variable names are agreed.
- Email: require verified email, enabled category/channel preference, template, idempotency, unsubscribe/preferences link where required, bounce/complaint suppression.
- WhatsApp: require valid E.164 number, persisted opt-in for the specific purpose, approved template, opt-out suppression and provider policy checks.
- No provider credentials in Git; use deployment secret storage.
- Do not activate live sends until sandbox and webhook verification pass.

### F. Queue, retries, webhooks and admin
- Use durable outbox + delivery records; do not rely on fire-and-forget HTTP from the follow or publish request.
- Add bounded worker batches, exponential backoff, max attempts, dead-letter status, manual retry with audit log, and rate limits.
- Authenticate delivery webhooks and make callback processing idempotent.
- Add admin read-only monitoring first; secret editing and live activation require role authorization and audit logs.

## Acceptance test matrix

| Scenario | Expected result |
|---|---|
| Followed creator publishes approved public video | One event per follower and enabled channel |
| Video is draft/pending/rejected/private/inactive | No follower notification |
| User unfollows before dispatch | Skip queued delivery |
| User blocks creator | Skip delivery |
| Channel preference disabled | No delivery on that channel |
| WhatsApp consent missing/revoked | No WhatsApp send |
| Email unverified/invalid | No email send |
| Same event is processed twice | One delivery record/message per recipient/channel |
| Provider timeout or 5xx | Retry safely; no duplicate logical delivery |
| Provider webhook repeated | Idempotent state update |
| Paid video notification | Paid label; entitlement remains enforced |
| Accepted eligible rating/review | Notify the reviewed creator/teacher per enabled channel |
| Pending/rejected/self/ineligible review | No creator-facing rating notification |
| Notification provider unavailable | Video publish/follow/rating operation remains successful; in-app path retained |

## Execution gates

This worklist is not a claim that implementation or provider delivery is complete. Before code is merged, run the project Node 22 release script, TypeScript, ESLint, Next production build, Node contract tests, Firebase Emulator authorization tests, and provider sandbox tests. Keep all production provider flags off until the gates pass.

## Immediate next implementation step

Inspect and document the exact video publication transition and rating/review write path, plus any block relationship schema. Only then wire the event producers. This avoids sending on upload rather than publication, inventing a rating eligibility rule, or bypassing existing moderation.
