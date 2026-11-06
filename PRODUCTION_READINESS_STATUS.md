# Production Readiness Status — continuation

This package contains incremental safety fixes, not a production certification.

## Changes in this continuation
- Wallet subscription now waits for Firebase Auth state instead of reading `auth.currentUser` once during mount.
- Wallet subscription is cleaned up on sign-out/account switch/unmount.
- Invalid, non-finite, and negative wallet amounts are normalized to zero for display.
- Wallet read failures are surfaced as an explicit unavailable state rather than silently looking like a valid zero balance.

## Verification status
- Source ZIP integrity: verified after packaging.
- Full TypeScript check / ESLint / Next.js production build: NOT VERIFIED. Dependency installation did not complete within the available execution window.
- Firebase Emulator, Firestore rules, Cashfree sandbox, refund, webhook, inventory and end-to-end tests: NOT RUN.
- Live payments and payouts must remain disabled until provider certification and financial ledger tests pass.

Do not treat this artifact as production-ready or deploy it to production without the outstanding checks above.
