# JEMBEE PLAY — Video-only scope cleanup

**Date:** 09 November 2026  
**Scope:** Remove Shopping / product-selling / MLM user journeys from the JEMBEE PLAY application source while retaining video-platform functionality.

## Product boundary

JEMBEE PLAY is limited to video, Shorts, School Learning, creators, teachers, sharers, moderation, social features, admin operations and video-related earnings. Shopping, product selling, cart, inventory, shipping, seller/vendor and multi-level sponsor/downline commission journeys are outside this product.

The original uploaded ZIP and the extracted baseline were not overwritten. The edits described below are in the separate cleaned source copy.

## Changes made in the cleaned source

### Registration and account profiles

- New profile creation no longer accepts or writes the old JBK sponsor code, sponsor tree, parent chain, package activation, rank, level-count, downline, product purchase or shopping-order profile fields.
- Signup and login no longer capture the legacy `jbk_pending_ref` local-storage value or send an MLM sponsor code to profile creation.
- The basic profile factory now contains video-platform account and balance fields, without sponsor-tree, package, rank or multi-level fields.
- Legacy multi-level registration helper modules and their barrel exports were removed from the active source surface.
- Existing Firestore user documents and historical records were not bulk-edited or deleted.

### Admin and UI cleanup

- Admin theme preview now shows video and learning content instead of product cards and Add To Cart examples.
- Push-notification audiences now use platform roles (Creators, Teachers, Sharers, Moderators) instead of Sellers and Affiliates.
- The sample Order Manager role was changed to Video Moderator.
- Customer support sample tickets and page labels now concern viewers, creators, playback, paid-video refunds and account access.
- App Settings no longer displays or writes the old delivery-charge field. When the settings page reads the old settings document, it copies only the known JEMBEE PLAY settings into local state.
- Old external JembeeKart shopping promotion links were removed from the video UI; promotion now points to the in-app School Learning route.
- Legacy storage placeholder text was changed from a product photo to a video thumbnail.
- Admin messages and hardcoded scanner terms were updated for the video platform.

### Video performance

- Shorts now sets `preload="metadata"` for only the active video and next four eligible visible videos. Paid videos remain excluded until the viewer is authorized.
- Existing thumbnail preloading for the active video and next four continues. Full-video auto-download is not introduced.

## Video-platform capabilities deliberately preserved

- Creator video upload, Google Drive resumable upload, moderation and publication flow.
- Approved / active / safe gating for public videos.
- Paid-video Cashfree order creation, provider verification, webhook, purchase entitlement, secure playback session and refund reversal.
- Per-video, authenticated share attribution for Sharers.
- Creator 30% / Sharer 20% / Platform 50% ledger allocation and the separate Teacher Referral 2% ledger, according to the defined eligible revenue base.
- Likes, comments, reports, follows, rewards and wallet/ledger functionality used by video features.
- Existing Firestore and Google Drive configuration files and historical records.

The word `order` in paid-video routes means a purchase of access to a video, not a shopping order. The `sponsor` boolean in creator moderation is video sponsorship metadata, not an MLM sponsor-tree relationship; it was not removed without confirming its exact product behavior. Two sponsor-budget helper files have no source call sites found in the targeted scan and are retained for a separate video-ad architecture review rather than being deleted by guesswork.

## Remaining items / explicit limitations

1. The old support/admin contact defaults still use `@jembeekart.com` in two UI-only screens. A JEMBEE PLAY contact address has not been provided, so no replacement address was invented.
2. Historical Firestore documents/collections may still contain old Shopping/MLM fields. No live database migration or deletion was performed.
3. The School Learning directory still contains clearly-labelled example school data and is not a production-backed catalog yet; this is a later roadmap item, not Shopping functionality.
4. The existing support contact and security screens are UI prototypes; do not treat them as verified security or contact-management systems.
5. This is source-level cleanup only. Firebase production data, Google Drive OAuth, Cashfree provider credentials/webhooks, Android devices and deployment were not connected or live-tested.
6. `node_modules/next` and `@types/node` are unavailable in this working copy. Dependency installation did not complete in this environment. A global TypeScript run failed because Node type definitions are missing and the installed global TypeScript does not accept the repository's `ignoreDeprecations` setting. Next.js production build, project TypeScript check and ESLint are therefore **not verified**.
7. GitHub write access remains blocked by the integration's 403 error. No branch, commit or push was created.

## Regression test evidence

Command:

```bash
find src -type f \( -name '*.test.mjs' -o -name '*.spec.mjs' \) -print0 | xargs -0 node --test
```

Result at this cleanup checkpoint: **79 tests passed, 0 failed**.

The tests include the previously failing Shorts metadata-preload contract, the profile/signup MLM-removal contract, paid-video checkout and entitlement, Cashfree refund reversal, 30/20/50 ledger allocation, separate Teacher 2% referral calculation, video-share attribution and security-related route contracts.

## Phase status

- Source-level video-only cleanup: **implemented in this archive**.
- Regression tests above: **passed**.
- Next.js build / TypeScript / lint: **not verified** due incomplete dependencies.
- Firebase/Drive/Cashfree live integration: **not verified**.
- Production release: **not approved**.
- Live creator/teacher/sharer payouts: **must remain disabled** until settlement implementation, tests and manual reconciliation are signed off.
