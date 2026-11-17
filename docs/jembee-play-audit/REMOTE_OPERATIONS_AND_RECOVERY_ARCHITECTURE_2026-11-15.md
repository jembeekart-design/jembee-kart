# JEMBEE PLAY Remote Operations & Recovery Architecture

Date: 2026-11-15
Status: Engineering specification; implementation and production verification required.

## Goal

An authorized operator should be able to diagnose and recover supported JEMBEE PLAY website, Android Mobile and Android TV failures from the web Admin Control Center wherever the fault is recoverable through server-side configuration or a compatible app update.

This is remote operations, not a promise that every fault can be repaired without a new app binary or physical access.

## Admin control center

Add a dedicated, RBAC-protected **System Health & Remote Recovery** area to the website admin:

1. **Service health:** website/API, Firebase Auth, Firestore, Storage, video stream provider, thumbnail provider, payment provider, ad provider, notification provider and learning catalog. Show last check time, latency, status and sanitized error code. Never expose credentials, tokens, raw secrets or personal data.
2. **App fleet:** mobile/TV app version, build number, platform, last-seen time, supported remote-config schema, minimum supported version and update status. Use privacy-preserving installation IDs; do not collect unnecessary device identifiers.
3. **Remote configuration:** validated, versioned settings for API base URL, feature availability, navigation, theme, playback defaults, cache limits, maintenance banner and support links. Config must be signed/authenticated, schema-versioned, cached safely and have a last-known-good fallback.
4. **Feature kill switches:** disable a broken feature (uploads, ads, paid checkout, notifications, learning catalog, etc.) independently. Server APIs must enforce the switch; hiding a button in the app is not security.
5. **Incident controls:** maintenance mode, read-only mode for selected modules, disable new paid orders, disable new uploads, pause ads, and rollback to a previous known-good config. Never automatically change settlement ledger records or issue payouts.
6. **Diagnostics:** app-reported crash summaries, failed API categories, playback error classes, build/version distribution and correlation IDs. Redact email, phone, payment data, auth tokens and video private URLs.
7. **Audit trail:** immutable actor, timestamp, before/after config version, reason, affected platform, approval and rollback reference for every privileged action.
8. **Support bundle:** user can choose to share a limited diagnostic report; preview and consent required. No silent collection of files, contacts, location or personal content.

## Recovery levels

- **Level 1 — Website-side fix:** configuration, feature flag, maintenance notice, API routing, server-side bug fix and rollback can be delivered from the web admin/server without reinstalling an app, provided the installed app already supports the config.
- **Level 2 — Compatible app remote update:** app behavior can change only within capabilities already shipped in that app (remote config, content, navigation, feature toggles). Remote config must not download or execute arbitrary code.
- **Level 3 — New app build required:** native code defects, Android permission/manifest changes, SDK upgrades, new native capabilities, TV input bugs, security fixes in bundled dependencies and incompatible API contract changes require a newly signed APK/AAB and user update. Force-update only for critical security or compatibility issues, with a clear update path.
- **Level 4 — Provider/device intervention:** Firebase outage, DNS/domain failure, hosting account lockout, revoked signing key, damaged device/storage or third-party provider outage may require provider console, infrastructure access or physical device action.

## Required safety and reliability

- All admin endpoints require server-verified admin role, least privilege and re-authentication for high-impact actions.
- Validate config against a strict schema; reject unknown keys and invalid URLs/values.
- Use staged rollout (internal → small percentage → all), health gates, automatic stop on elevated error rate and one-click rollback.
- Keep config history and last-known-good snapshot. Config changes must be idempotent and auditable.
- Use bounded retries, timeouts, circuit breakers and graceful degraded states.
- Never let a remote flag bypass authentication, paid-video entitlement, moderation, ad policy, Firestore rules or server-side authorization.
- Paid checkout, refunds, creator/sharer settlement and teacher commission require independent financial controls. Remote operations must not edit balances or enable live payouts.
- Do not show “healthy” merely because a process responds; check critical dependencies and synthetic flows.
- Keep admin access separate from public app access; protect against CSRF, replay and unauthorized config writes.

## Native app contract

Both Android apps should ship with:
- A remote-config client with signed/HTTPS transport, schema compatibility checks, ETag/version support, bounded refresh, local last-known-good cache and safe defaults.
- A small diagnostics client with opt-in crash/diagnostic reporting and redaction.
- A maintenance/update screen and a clear minimum-version/update URL flow.
- No arbitrary remote code execution or silent APK installation.
- Graceful operation when config service is offline.

## Release acceptance checklist

- Admin can see health status for every configured dependency and understand stale/unknown status.
- Admin can disable one feature without disabling unrelated playback or login.
- Mobile and TV fetch, validate, cache and fall back from remote config.
- A bad config is rejected; rollback restores last-known-good config.
- RBAC, re-authentication, audit logging, rate limits and abuse tests pass.
- Staged rollout and forced-update behavior are tested on physical Android phone and Android TV/Google TV.
- Security review confirms no secret leakage and no remote executable code.
- End-to-end recovery drills are recorded before production sign-off.

## Current implementation status

This document defines the target. The current native Mobile/TV foundation and Download Centre do **not** yet implement the health dashboard, remote-config service/client, crash reporting, staged rollout, OTA updates or recovery controls. Do not describe the platform as remotely repairable until those components are implemented and tested.

A website-side code deployment can repair website/backend code. It cannot rewrite arbitrary native app code already installed on a user's phone or TV.
