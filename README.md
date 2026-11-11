# JEMBEE PLAY — Video-Only Source Package

यह archive JEMBEE PLAY के video-first scope के लिए है: Home/Video, Shorts, School Learning, Creators, Teachers, Sharers, social/moderation, admin operations और eligible video-related earnings. Shopping, product selling, cart, inventory, shipping, seller/vendor और MLM sponsor-tree/downline journeys इस source scope से बाहर हैं।

## Package contents
- Next.js + TypeScript web source and API routes
- Firebase Auth/Firestore/Storage rules and configuration
- Google Drive upload/storage integration source
- Shorts/video feed, playback, moderation, social and admin surfaces
- Paid-video Cashfree server verification, secure playback session, refund reversal and ledger contract tests
- Creator 30% / Sharer 20% / Platform 50% allocation logic and separate Teacher Referral 2% calculation/tests
- Master Plan Word document and five original UI reference screenshots under `docs/jembee-play-audit/reference-inputs/`
- 19-phase delivery matrix, source audits and test evidence

## Quick start (Node.js 22.x)
```bash
cp .env.example .env.local
# Fill only the required variables locally; never commit .env.local
npm ci
npm run dev
```

## Verification
Run dependency-free contract tests:
```bash
find src -type f \( -name '*.test.mjs' -o -name '*.spec.mjs' \) -print0 | xargs -0 node --test
```

Run the full release gate (requires npm registry access):
```bash
bash scripts/verify-release.sh
```

## Latest source-level test result
- Node.js `v22.16.0`
- **81 tests passed, 0 failed** across all Node contract test files.
- TypeScript/TSX syntax parse: 300 files, 0 syntax diagnostics (global TS 5.8.3; not semantic typecheck).
- ESLint and Next.js production build were not re-run after the latest source-repair patch. The user's Termux build output before this patch passed Next.js compile, TypeScript and 94 static pages. Re-run `bash scripts/verify-release.sh` on this delivered source before release.
- This does not certify Firebase Emulator/live Firebase, Google Drive OAuth, Cashfree sandbox, ad approval, Android builds/devices or production deployment. See `docs/jembee-play-audit/ESLINT_REPAIR_STATUS_HI_2026-11-09.md`.

## Non-negotiable safety gates
- Keep live Creator payouts disabled until production settlement and manual reconciliation are verified and approved.
- Keep paid-video checkout disabled until Cashfree webhook, INR amount/currency, entitlement, playback and refund behavior are verified in the target environment.
- Do not delete historical Firebase records or Google Drive files as part of source cleanup.
- Never include real `.env` values, service-account credentials, OAuth refresh tokens, PEM/P12 keys or provider secrets in source archives.
- Do not enable any ad provider until approved Admin placements and provider policy compliance are verified. The current Monetag source is not an Adsterra integration.

## Current delivery status
This is a **Video-Only source and test package**, not a production-ready 19-phase release. Multiple plan phases remain partial or unstarted, especially production School Learning CRUD, the complete reference-matched Shorts UX, Admin-controlled ad integration, Android Mobile and Android TV/Google TV. See the phase matrix.
