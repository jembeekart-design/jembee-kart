# Phase 54 — Shipping Admin Settings persistence audit

## Main finding

`src/app/admin/shipping/page.tsx` is currently a presentation-only settings screen:
- `shippingCharge` is initialized as the string `99` in local React state.
- `freeShipping` is initialized as the string `999` in local React state, although the label says “Free Shipping Limit”.
- The “Save Settings” button has no `onClick` handler.
- No Firestore read/write or API request exists in this page.
- COD and tracking toggles also only change local component state.
- The displayed settings are therefore not durable configuration and cannot safely drive server invoice calculations.

## Cross-check against active configuration

`src/lib/admin-config/types.ts` models shipping as:
- `freeShipping: boolean`
- `shippingCharge: number`
- `deliveryDays: number`

`src/lib/admin-config/defaults.ts` currently supplies:
- `freeShipping: false`
- `shippingCharge: 0`
- `deliveryDays: 0`

`src/lib/admin-config/provider.tsx` reads the `settings/shipping` Firestore document for the client admin-config context. The shipping admin page does not use that provider or persist to that document.

## Risk

**High — configuration integrity and customer invoice correctness.**

The UI can make an administrator believe a charge/threshold has been saved when it has not. The active order API currently ignores shipping settings, and checkout hardcodes free delivery. Connecting invoice calculation to this page before fixing its persistence would risk using stale/default values.

## Safe implementation sequence

1. Replace this presentation-only screen with a server-authorized settings API or an existing trusted admin-config write path.
2. Define one canonical schema. Recommended fields:
   - `shippingConfigured: boolean`
   - `freeShippingEnabled: boolean`
   - `freeShippingThreshold: number | null`
   - `shippingCharge: number`
   - `deliveryDays: number`
   - `updatedAt`, `updatedBy`
3. Validate all money values in integer paise (or strictly validate INR decimals to at most 2 decimal places); reject negative, NaN, Infinity, and unsafe values.
4. Ensure admin authorization is checked server-side; deny client writes to the canonical settings document in Firestore rules.
5. Add a read-after-write confirmation and clear error state in the admin UI.
6. Only then implement the authenticated quote endpoint and share its server-only calculation with order creation.
7. Test settings persistence, threshold boundary, explicit free shipping, paid shipping, malformed values, authorization denial, and payment amount parity.

## Phase decision

No code changes were made in this phase. The existing admin page is not connected to persistence, so adding a quote calculator now would rely on defaults or invented assumptions. The audit report is included in the cumulative ZIP.

## Verification limits

Static source inspection only. No Firestore emulator, deployed admin settings, browser interaction, or production configuration was accessed.
