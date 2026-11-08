# JEMBEE PLAY Paid Video Checkout-to-Settlement Runbook

## Implemented server path

1. Admin moderates a paid-video submission. Moderation marks it approved/safe but keeps it inactive and sets `paidVideoStatus=pending_admin_activation`, `paidCheckoutEnabled=false`, and viewer coins to zero.
2. An authorized Admin explicitly enables a paid video through `POST /api/admin/shorts/paid-video/enable`. The API requires `SHORTS_PAID_VIDEO_CHECKOUT_ENABLED=true`, enabled Cashfree credentials, and an approved/safe paid video with a valid INR price.
3. A signed-in buyer starts checkout through `POST /api/shorts/paid-video/create-order`. The server reads the price and creator from Firestore, prevents self-purchase, creates an idempotent Cashfree order, and stores the internal order plus provider order/session identifiers.
4. Cashfree signed webhook resolves the Shorts paid-video order only. On a successful INR payment with matching amount and eligible video, one Firestore transaction grants the purchase, records the payment event, marks the order paid, and writes the 30/20/50 settlement ledger.
5. The return verification API independently fetches Cashfree payment history and grants the same entitlement/ledger idempotently if the browser return happens before/without webhook processing.
6. Refund reconciliation reads Cashfree refund history, applies cumulative incremental reversals, and revokes purchase access on full refund.
7. Admin Teacher Referral reconciliation calculates 2% only from platform share after confirmed refund reversals and verified expense evidence. Re-running reconciliation updates the profit/commission and appends adjustment entries when the verified basis changes.

## Required deployment configuration

- `CASHFREE_PAYMENTS_ENABLED=true` only after Sandbox validation.
- `SHORTS_PAID_VIDEO_CHECKOUT_ENABLED=true` only after all Sandbox tests pass.
- `CASHFREE_CREDENTIALS_ENCRYPTION_KEY` must be a valid base64-encoded 32-byte key.
- `NEXT_PUBLIC_APP_URL` must be the canonical HTTPS application URL.
- Firebase Admin credentials must be configured server-side.
- Cashfree Admin settings must contain encrypted App ID/Secret/Webhook Secret and `enabled=true`.
- Configure Cashfree webhook URL: `/api/payments/cashfree/webhook`, with payment success events enabled.

## Operational sequence before production

1. Keep both feature flags false while deploying the code.
2. Configure Cashfree Sandbox credentials and webhook.
3. Approve one internal test video and enable it via the admin API.
4. Run buyer checkout; confirm provider order, payment session, signed webhook, purchase entitlement, and all three ledger entries.
5. Run the same webhook twice; confirm no duplicate purchase or ledger rows.
6. Verify amount mismatch, wrong currency, self-purchase, unpublished video, and duplicate successful payment are rejected/manual-review.
7. Run partial then full Sandbox refund; confirm exact cumulative reversals and full-refund access revocation.
8. Reconcile Teacher Referral with verified expense evidence; then add a verified cost or refund and rerun to confirm adjustment entries.
9. Only after all tests pass should `CASHFREE_PAYMENTS_ENABLED` and `SHORTS_PAID_VIDEO_CHECKOUT_ENABLED` be enabled in production.

## Explicit remaining limitations

- Sharer attribution has no trusted paid-video share-event producer in this source snapshot. The 20% share remains unallocated unless a future server-verified share-event flow writes trusted attribution. Client-supplied sharer IDs are not accepted.
- No wallet credit or bank payout is issued by this flow. Ledger rows remain pending settlement until a separately audited wallet/payout process is implemented.
- Live Cashfree Sandbox/Production transactions, Firebase Emulator rules tests, TypeScript compilation, and Next.js production build have not been executed in this environment.
