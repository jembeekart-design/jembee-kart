# Phase 55 — Shipping settings secure persistence patch

## Changes made

### 1. New admin API
Added `src/app/api/admin/shipping/route.ts`:
- GET and PUT require a Firebase ID token verified with revocation checking.
- Server checks the user's `admin` or `super_admin` role from the trusted users collection.
- Uses Admin SDK to read/write `settings/shipping`.
- Rejects unknown/missing fields and oversized request bodies.
- Validates non-negative INR amounts with at most two decimal places, a nullable threshold, and delivery days from 0 to 90.
- Stores `shippingConfigured: true`, `updatedAt`, and `updatedBy`.
- Returns no-store responses.

### 2. Admin UI connected
Rewrote `src/app/admin/shipping/page.tsx`:
- Loads saved settings from the authenticated API.
- Save button now performs a real PUT and shows success/error feedback.
- Adds explicit free-shipping toggle, delivery charge, optional free-shipping threshold, and delivery-days inputs.
- Removes the previous local-only COD and tracking toggles because they were not persisted by this settings API and did not belong to the shipping schema.
- Shows that checkout will not use the settings until quote integration is completed.

### 3. Shared config schema
Updated `src/lib/admin-config/types.ts` and `src/lib/admin-config/defaults.ts` to include optional `freeShippingThreshold`, defaulting to null.

## Safety boundaries
- Firestore client rules were not loosened. Client writes to `settings/shipping` remain denied by the catch-all rule; the API uses Admin SDK after server-side authorization.
- This patch does NOT yet apply shipping fees to order totals or checkout.
- Existing shipping document fields are merged, not destructively replaced.
- No production settings were read or changed.
- No payouts/payment mode were enabled.

## Static checks
Passed source assertions for admin token verification, role checks, Admin SDK persistence, money precision validation, threshold support, API-connected UI load/save, removal of fake local toggles, and checkout integration warning.

## Verification limits
No dependency installation, TypeScript build, Firebase Emulator, browser interaction, or deployed admin API test was run. The user must test in a non-production Firebase environment before release.
