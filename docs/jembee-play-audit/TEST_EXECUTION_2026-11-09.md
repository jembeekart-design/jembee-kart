# Test Execution Evidence — 09 November 2026

Command executed from project root with Node.js v22.16.0:

```bash
node --test $(find src -type f \( -name '*.test.mjs' -o -name '*.spec.mjs' \) | sort)
```

Result:
- Test files: 23
- Tests: 79
- Passed: 79
- Failed: 0
- Skipped: 0

Coverage groups include account/profile video-only contract, signup removal of MLM capture, moderation and expense evidence, cashfree paid-video checkout/webhook/playback/refund contracts, ledger split and teacher referral calculation, share attribution, Shorts page and five-card metadata/thumbnail preload, and storage rules contracts.

Not covered by this run: Next.js build, TypeScript, ESLint, Firebase Emulator/live project, Google Drive OAuth, Cashfree sandbox, ad-provider approval and Android device/emulator tests.

Dependency installation attempt was blocked by DNS/network: `EAI_AGAIN getaddrinfo registry.npmjs.org`. Do not interpret Node contract tests as production release certification.
