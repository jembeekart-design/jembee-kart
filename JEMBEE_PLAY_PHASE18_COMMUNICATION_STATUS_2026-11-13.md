# JEMBEE PLAY Phase 18 — Communication contracts

## Implemented
- Added provider-neutral communication contracts for in-app, email and WhatsApp channels.
- Bounded recipient, subject and message inputs; validated email and E.164 phone formats.
- WhatsApp sends require explicit consent in the request contract.
- Added deterministic recipient/channel/event idempotency-key helper.
- Added contract tests for valid and invalid requests.

## Not implemented / not verified
- No email, WhatsApp Business API or push provider is connected; no message is sent by this module.
- No persisted consent/unsubscribe ledger, template approval, rate-limit queue, retry/dead-letter worker, delivery webhook, bounce handling or admin communication console.
- Existing in-app notification routes remain the source of current delivery behavior; no Firestore collection migration was performed.
- Full TypeScript, ESLint, Next.js production build and Firebase Emulator integration remain required.

## Safety
- Do not treat a boolean request field as proof of durable WhatsApp consent; verify persisted consent before any provider call.
- Do not send marketing messages without recorded opt-in and a working opt-out mechanism.
- No paid-video or payout flags were changed.
