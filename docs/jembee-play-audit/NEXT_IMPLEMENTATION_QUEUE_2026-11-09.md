# JEMBEE PLAY — Next Implementation Queue

Baseline is the 09 Nov 2026 `main` ZIP. Items are ordered by dependency and production risk. A status of `BLOCKED` means code changes should not be marked complete until the documented prerequisite is met.

| Order | Work item | Primary files / systems | Acceptance evidence | Status |
|---|---|---|---|---|
| 0 | Restore build-capable environment; read Next.js 16 local docs | `package-lock.json`, `AGENTS.md`, Next package docs | `npm ci`, `npx tsc --noEmit`, `npm run lint`, `npm run build` | BLOCKED: npm install timeout |
| 1 | Fix Admin Mobile App settings persistence | `src/app/admin/mobile-app/page.tsx`, new `/api/admin/mobile-app-settings`, `firestore.rules` only if needed | Admin/guest API tests; settings persist in test Firebase | PLANNED |
| 2 | Shorts For You/Following controls | `src/app/shorts/page.tsx`, `ProductionHeader.tsx` | tab accessibility and following-feed contract/UI tests | PLANNED |
| 3 | Shorts bottom navigation | `BottomQuickActions.tsx`, `/` and `/videos` routes, `/videos/reward-center` | Home opens Home; Earn opens approved Reward Center; no fake balance | PLANNED |
| 4 | Persist Shorts Save | `VerticalVideoFeed.tsx`, `saveVideo.ts`, profile watch-data API, authenticated server API | save/unsave survives reload and appears in Profile/Library; denied for unauthorized users | PLANNED |
| 5 | Add Share inside More sheet | `VideoActions.tsx`, `ShortsMenuSheet.tsx`, existing `handleShare` in `VerticalVideoFeed.tsx` | same attribution-safe share flow from rail and sheet | PLANNED |
| 6 | Design Block channel | new user-scoped relationship, authenticated API, feed filter, unblock UI | creator hidden from feed; users cannot block others' behalf; unblock works | PLANNED; semantics to be documented |
| 7 | Fix visible metadata preload test and implementation | `VerticalVideoFeed.tsx`, `VideoPlayer.tsx`, `video-preload-cache.test.mjs` | five thumbnail+metadata window; tap-only first segment; no full video auto-download | IMPLEMENTED; contract test passes; runtime/browser verification pending build environment |
| 8 | Production Home feed and watch route | `src/app/page.tsx`, watch route, feed API, admin section config | real approved data; stable videoId route; empty/loading/error/retry states | PLANNED |
| 9 | School Learning normalized catalog | `src/app/learn/school/`, `src/app/admin/education/`, new API and Firestore collections | CRUD, stable IDs, search, pagination, mapping, real data | PLANNED |
| 10 | Manual ad placement adapter | `AdSlotManager`, `ExternalAdSlot`, placement renderers, admin API | Admin ON/OFF/frequency/targeting; verified provider; no popunder/redirect | PLANNED |
| 11 | Android Mobile app | new native app project | installable build, video-only nav, permission/deep-link/download tests | BLOCKED: no native project/screenshots |
| 12 | Android TV/Google TV app | separate TV app project | TV D-pad/focus/player tests on emulator + device | BLOCKED: no native project/screenshots |
| 13 | Release verification | all modules, Firebase emulator, Cashfree sandbox, Drive test account | typecheck/lint/build, regression/security/performance, device tests | PLANNED |

## Guardrails

- Do not add shopping/MLM UI to JEMBEE PLAY.
- Preserve Google Drive integration and existing safe moderation gates.
- Do not make a video public unless approved, active and safe.
- Fail closed on paid-video entitlement uncertainty.
- Keep creator 30%, sharer 20%, platform 50%; teacher referral 2% in separate ledger.
- Do not enable live payouts before settlement, refunds, automated tests, reconciliation and explicit sign-off.
- No automatic full-video downloads; only latest/visible 4–5 thumbnails and metadata, plus tap-time initial segment preload.
- Admin chooses manual ad placements, within current network policy. No popunder, forced redirect or prohibited formats.
- Every locked phase requires test evidence and user-approved change control.
