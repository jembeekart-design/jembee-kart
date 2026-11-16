# JEMBEE PLAY — Admin Control Matrix

Last updated: 2026-11-16

This document defines the intended control surface for the JEMBEE PLAY Admin. A capability marked **Implemented in Website Studio** is part of the current Website Studio rollout. A capability marked **Planned** must not be presented as already working.

## 1. Website Studio — implemented in the current rollout

Settings are stored in admin_settings/site_experience. The public endpoint at /api/public/site-experience returns only an allowlisted, validated subset. It does not expose private integration credentials.

| Admin control | Stored field | Public Home behaviour |
| --- | --- | --- |
| Website display name | siteName | Header and navigation branding |
| Tagline | tagline | Navigation/footer tagline |
| Primary brand colour | primaryColor | Brand token and announcement strip |
| Accent colour | accentColor | Brand token |
| Page background | pageColor | Public Home background token |
| Surface/card colour | surfaceColor | Brand token |
| Learning headline | heroTitle | Home Learning banner |
| Learning description | heroSubtitle | Home Learning banner |
| Announcement enabled | announcementEnabled | Show/hide announcement strip |
| Announcement message | announcementText | Announcement strip text (max 180 chars) |
| Learning banner visibility | showLearningBanner | Show/hide Home Learning banner |
| Shorts section visibility | showShorts | Show/hide Home Shorts section |
| Long video section visibility | showLongVideos | Show/hide Home Long Videos section |
| Home ad placements visibility | showHomeAds | Show/hide the existing Home ad placements only |
| Compact video cards | compactCards | Increase desktop long-video grid density |
| Home section order | sectionOrder | Reorder Learning, Shorts, and Long Videos on Home |
| Home category chips | homeCategories | Add, rename, filter, reorder, hide/show, and remove up to 12 category chips |
| Main navigation labels | navigationLabels | Rename the six supported main navigation labels without changing their routes |

The public endpoint validates colour values, text lengths, booleans, section order, category IDs/labels/filters, and the allowlisted navigation-label keys. It uses safe defaults when settings are absent or unavailable. Category chips filter the Home feed using their configured text filter; they do not create new content categories in the creator upload catalogue.

## 2. Next Admin Studio modules — planned

### Content and navigation
- Reorder Home sections and choose which supported sections appear.
- Manage category chips, category ordering, and featured topics.
- Manage featured playlists, featured creators, and editorial collections.
- Manage navigation order and footer links.
- Manage launch banners, maintenance notices, and scheduled announcements.
- Manage static information pages and support links.

### Design system
- Preset themes with preview and publish.
- Typography scale, border radius, card density, spacing, and thumbnail aspect ratio presets.
- Home hero artwork and approved brand assets.
- Light/dark theme only after all major pages support both modes.
- Responsive preview for phone, tablet, and desktop.

### Learning library
- Manage Board/Curriculum, School, Class, Subject/Book, and Chapter master data.
- Publish/unpublish and archive learning catalogue entries with dependency checks.
- Manage original JEMBEE practice content and provenance/rights metadata.
- Do not require Admin to create every textbook Question node; teachers enter printed question numbers and the system discovers approved answer videos.
- Preserve legacy question-linked videos.

### Creator and video operations
- Moderation queues, reports, comments, video metadata, and creator access.
- Upload limits, supported formats, and review guidance.
- Feature/visibility controls that never bypass moderation or rights checks.
- Playback health, thumbnail availability, and storage/CDN monitoring.

### Monetization and communications
- Ad placement inventory and enablement for approved placements.
- Verified revenue import/reconciliation and discrepancy review.
- Announcement, notification, and support workflows.
- Creator/sharer/teacher settlement reports with immutable calculation records.

### Operations and governance
- Admin roles and least-privilege permissions.
- Audit log for every configuration change (actor, timestamp, before/after).
- Draft preview, explicit publish, and rollback to a prior published version.
- Maintenance mode with emergency bypass limited to authorized operators.
- SEO metadata and social preview controls.
- Localization and supported language settings.

## 3. Controls that must remain protected

Website Studio and ordinary content controls must never:
- Mark a video approved or moderation-safe without the moderation workflow.
- Expose paid videos without the global checkout flag, per-video Admin enablement, verified payment, and entitlement checks.
- Enable live creator payouts before settlement implementation and required tests are verified.
- Create watch rewards from unverified views or incomplete watch sessions.
- Alter verified ad revenue or the 30% Creator / 20% Sharer / 50% Platform split outside the verified settlement process.
- Change the Teacher Referral 2% basis from actual Admin net profit.
- Expose API keys, OAuth refresh tokens, payment secrets, or private provider credentials to the public endpoint.
- Remove textbook provenance, licensing, or commercial-use checks.

## 4. Release requirements

Before publishing a new Admin-controlled setting:
1. Define a typed schema, safe default, validation, and maximum input lengths.
2. Enforce authorization on the server or through verified Firestore rules; hiding a UI control is not authorization.
3. Keep public reads restricted to explicitly allowlisted non-secret fields.
4. Add contract tests for defaults, invalid values, and access boundaries.
5. Add audit history and rollback for high-impact settings.
6. Verify TypeScript, changed-code lint, contract tests, and production build.
7. Confirm the live deployment before calling the setting operational.

## 5. Current release status

- Website Studio UI, safe public settings endpoint, Home page integration, and configurable section ordering are proposed in PR #65.
- The layout builder supports moving Learning, Shorts, and Long Videos up/down; its preview follows the same order.
- PR #65 is Draft and stacked on PR #64.
- Automated validation for the latest PR #65 head has not yet been confirmed.
- Nothing in this work is merged into main.
