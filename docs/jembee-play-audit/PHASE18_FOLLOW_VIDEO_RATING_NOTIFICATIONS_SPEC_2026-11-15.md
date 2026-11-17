# JEMBEE PLAY — Phase 18 Follow, Video, Rating & Review Notifications

**Date:** 15 November 2026  
**Status:** Approved product scope / implementation specification  
**Branch:** `phase18-follow-video-rating-notifications-2026-11-15`

## Scope protection

This is an additive feature specification. Do not delete, rename, disable, or replace existing JEMBEE PLAY pages, APIs, Firestore collections, notification flows, business rules, or data. Preserve existing in-app notifications and extend them. Do not change JembeeKart shopping/MLM or JEMBEE PLAY paid-video, creator/sharer settlement, teacher-referral, or payout rules.

## User-approved behavior

A user can independently choose In-app, Email, and WhatsApp for notification categories. Do not assume all channels are enabled. Respect each user's saved preferences and consent.

### Event A — New video from a followed creator/teacher

1. A creator/teacher uploads a video.
2. Do not notify followers while the video is a draft, pending review, rejected, inactive, private, or otherwise unavailable.
3. After moderation approval and successful public publication, create one notification event for each eligible follower.
4. Eligible recipients are users who still follow that creator/teacher, have not blocked them, and have enabled the relevant notification category/channel.
5. Include creator display name, video title/thumbnail when available, publication time, and a deep link to the canonical watch route.
6. Paid videos must be clearly labelled Paid; notification delivery never grants playback entitlement.
7. Unfollow, block, deleted/withdrawn video, or revoked publication status must prevent queued-but-not-yet-sent delivery where possible.
8. Never send duplicate notifications for the same published video, recipient, and channel.

### Event B — Rating and review activity

1. Notify the creator/teacher when an eligible rating or review is successfully accepted and saved.
2. Notify again only for a meaningful permitted review update; use idempotency to prevent duplicate sends.
3. Do not notify for rejected, spam, unverified/ineligible, self-authored, or still-pending reviews.
4. Do not expose private reviewer details beyond the product's approved visibility rules.
5. Admin/moderation notifications for reported or flagged reviews remain separate from creator-facing rating notifications.

## Channel behavior

- **In-app:** retain existing notification center and unread/read behavior.
- **Email:** send only when the user has a verified email address and has enabled the relevant email preference. Include a safe deep link and unsubscribe/preferences link for non-essential notifications.
- **WhatsApp:** send only after checking a persisted, auditable WhatsApp opt-in for the specific notification purpose, approved WhatsApp Business templates, valid E.164 phone number, provider policy and applicable messaging window. A request boolean alone is not consent. Include a working opt-out path.
- Channel preferences are independent. A user may select any combination of In-app, Email, and WhatsApp.
- Essential security/account messages must be separately classified and must not be used to bypass marketing opt-outs.

## Required implementation components

1. **Preferences:** persisted per-user category/channel preferences, consent timestamp/source/purpose, opt-out timestamp, and consent version. Add account settings UI without replacing existing settings.
2. **Event producers:** publish-video event after successful moderation/publication; accepted-rating/review event after authoritative server-side persistence.
3. **Recipient resolver:** server-side follower lookup with pagination/batching, current follow/block checks, account status, channel preferences, and consent.
4. **Outbox/queue:** durable event and per-recipient/channel delivery records; deterministic idempotency keys; bounded payloads; retries with backoff; dead-letter state; rate limits.
5. **Provider adapters:** provider-neutral email and WhatsApp interfaces. No provider credentials or secrets in source code. Provider selection/configuration must be admin-controlled and fail closed until configured and verified.
6. **Delivery webhooks:** authenticate provider callbacks; record accepted/delivered/failed/bounced/opted-out states without trusting client input.
7. **Admin console:** inspect event and delivery status, provider health, template approval, failure/retry state, and audit history. Do not expose secrets.
8. **Tests:** unit/contract tests, Firebase Emulator authorization tests, duplicate-event tests, consent/opt-out tests, follower pagination tests, provider failure/retry tests, and end-to-end tests for both event types.

## Security and reliability gates

- All event creation and recipient resolution must be server-authoritative.
- Client-side preference values are not proof of consent.
- Never send WhatsApp without a persisted opt-in and working opt-out.
- Do not leak follower lists or recipient contact details to creators or other users.
- Provider outages must not break video publication, ratings, or the existing in-app notification path.
- Use transactional outbox or equivalent durable handoff so a successful publish/review cannot silently lose notification events.
- Respect unsubscribe/opt-out before every send attempt, including retries.
- Do not send notifications for unpublished or unapproved videos.
- No live provider sends until sandbox, webhook authentication, templates, consent ledger, rate limits, and delivery audit are verified.

## Acceptance criteria

- A follower receives exactly one in-app notification for a newly approved public video when their in-app preference is enabled.
- Email and WhatsApp delivery occur only for independently enabled channels with valid contact details and applicable consent.
- A follower who has disabled a channel, unfollowed, blocked the creator, or opted out receives no new delivery on that channel.
- Pending/rejected/private videos produce no follower notification.
- Paid-video notification does not bypass purchase entitlement.
- Eligible accepted rating/review events notify the creator/teacher exactly once per event and per enabled channel.
- Failed provider delivery is retryable and auditable; duplicate retries do not create duplicate messages.
- Existing notification documents, routes, and read/unread behavior remain compatible.
- Full TypeScript, ESLint, production build, Firebase Emulator, provider sandbox and end-to-end checks pass before production activation.

## Current known baseline

The 13 November Phase 18 communication status reports provider-neutral contracts for in-app/email/WhatsApp, bounded payload validation, email/E.164 validation, WhatsApp consent requirement in the request contract, and deterministic idempotency-key helpers. It also reports that no email/WhatsApp/push provider is connected and that a persisted consent ledger, templates, queue/retry/dead-letter worker, delivery webhooks, bounce handling, and admin communication console are not yet implemented. This specification does not claim those components already exist.

## Implementation order

1. Inspect existing notification, follow, video moderation/publication, rating/review, Firestore rules, and admin settings paths; document compatibility.
2. Implement persisted notification preferences and consent ledger additively.
3. Implement durable event/outbox and recipient resolution.
4. Implement in-app follow-video and rating/review event delivery while preserving current notifications.
5. Add email provider adapter and sandbox verification.
6. Add WhatsApp Business provider adapter, template approval and opt-in/opt-out verification.
7. Add admin monitoring, delivery webhooks, retries, and complete automated tests.
8. Enable production delivery only after all gates pass.

**No provider is selected or activated by this specification. No secrets, live sends, Firebase writes, or production setting changes are authorized by this document.**
