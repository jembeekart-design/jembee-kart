# JEMBEE PLAY — Phase 2 Reference-to-Component Traceability

**Date:** 09 November 2026  
**Status:** `IN_PROGRESS` — static mapping prepared; visual/device acceptance is not yet run.  
**Source baseline:** `JembeeKart-main.zip` from repository `jembeekart-design/jembee-kart`, branch `main`.  
**Requirements:** `JEMBEE_PLAY_Master_Plan_With_Reference_Images.docx`  
**Image pack:** `JEMBEE_PLAY_Master_Plan_Image_Pack.zip` (5 original screenshots)

## 1. Scope and limits

This document maps the five supplied screenshots to candidate routes/components, observable source behavior, discrepancy IDs and acceptance tests. It is not a pixel-perfect approval and does not certify runtime behavior. No application source was modified while preparing this matrix.

The Master Plan says exact final School Learning and Android TV/Google TV screenshots were not included. Therefore those requirements are tracked as functional requirements with visual reference status `NOT SUPPLIED`, not as visual passes.

## 2. Reference register

| Reference ID | Original image file | Master Plan location | Page / target | Primary source mapping | Static result |
|---|---|---|---|---|---|
| REF-01 | `Jembee Video Phase 2 Preview.png` | Word doc page 3 (caption and requirements page 4) | Home video feed + watch page | `src/app/page.tsx`; candidate watch route `src/app/videos/original/[videoId]/page.tsx`; `VideoPlayer.tsx`, `VideoInfo.tsx`, `VideoActions.tsx`, `CommentDrawer.tsx` | `MISMATCH` |
| REF-02 | `Jembee Shorts Selfie Feed.png` | Word doc page 5 (caption / requirements page 6) | Full-screen Shorts feed | `src/app/shorts/page.tsx`; `ProductionHeader.tsx`; `FullscreenVideoFeed.tsx`; `VerticalVideoFeed.tsx`; `VideoActions.tsx`; `BottomQuickActions.tsx` | `PARTIAL` |
| REF-03 | `Jembee Shorts Options Menu(1).png` | Word doc page 7 (caption / requirements page 8) | Three-dot options sheet | `VideoActions.tsx`; `ShortsMenuSheet.tsx`; handlers in `VerticalVideoFeed.tsx`; related APIs under `src/app/api/shorts/` | `PARTIAL` |
| REF-04 | `Jembee Shorts Before and After.png` | Word doc page 8 | Bottom navigation before/after | `BottomQuickActions.tsx`; `ShortsMenuSheet.tsx`; `/videos` route | `MISMATCH / DEVICE CHECK PENDING` |
| REF-05 | `Jembee Shorts UI Before and After.png` | Word doc page 9 | Second bottom navigation / sheet comparison | Same as REF-04 | `MISMATCH / DEVICE CHECK PENDING` |

## 3. Detailed mapping and acceptance criteria

### REF-01 — Home Video Feed and Watch Page

**Image intent:** two-screen preview: a Home feed with category/filter tabs, video thumbnails/cards, creator and engagement metadata, Watch & Earn entry, and bottom navigation; plus a watch page with player/seekbar, title/views, creator/follow, like/comment/share/save, Watch & Earn, comments and Up Next.

**Observed source:**
- `/` is implemented in `src/app/page.tsx`. It currently defines six local demo videos, demo creator names, sample view counts and fixed remote thumbnail URLs. The page itself labels its cards as sample previews pending live feed integration.
- The Home page search/filter only operates over that local six-item list. Category chips are hardcoded.
- Home video thumbnail/title links currently open `/shorts`, not a stable video-specific watch URL.
- `/videos/original/[videoId]` exists, but its current UI is titled “Original Video”; it fetches one `watchEarnVideos` document and derived videos. It does not implement the full watch-page composition in the reference (creator/follow actions, comments, Watch & Earn panel, Up Next/autoplay controls).
- `/videos` currently redirects to `/shorts`; it is not a generic watch/home route.

**Traceability findings:**
- `R01-HOME-DATA`: live Firebase/API home feed and admin-ordered sections are not demonstrated by the Home page — `FAIL`.
- `R01-CATEGORY`: dynamic/admin-managed categories are not demonstrated; current chip list is static — `FAIL`.
- `R01-CARD-ROUTE`: clicking a card must open the matching video ID, not the generic Shorts route — `FAIL`.
- `R01-WATCH-COMPOSITION`: a full watch page with requested actions/comments/related videos/Watch & Earn panel is not present on the candidate original route — `FAIL`.
- `R01-PLAYER`: the codebase has a reusable `VideoPlayer`, but the candidate original page uses a native `<video>` element; parity of player controls and network behavior is not established — `PARTIAL`.

**Acceptance tests required:**
1. Home feed returns only eligible server-approved records and renders loading, empty, error and retry states.
2. Recommended/Trending/Latest/Popular/Continue Watching/Education/Creator sections use real data and their order/visibility follows admin config.
3. Search and category filters operate on the server-backed feed and pagination/infinite loading does not duplicate or skip IDs.
4. Every card carries a stable video ID; tapping it opens the matching watch route and the correct item.
5. Watch page renders player, title, creator, views, follow state, like/comment/share/save, comments and related/Up Next from real records.
6. Watch & Earn/reward elements appear only when the related reward backend is enabled and eligible; no display-only balance or reward promise.
7. Playback, seek, quality, speed, captions, retry and next/previous behavior pass mobile and desktop tests where supported.

### REF-02 — Shorts Feed

**Image intent:** vertical full-screen feed; For You / Following tabs; coin/reward entry; right-rail creator/follow, like, comment, share, save and more actions; creator/caption/audio metadata; bottom Home / Explore / Upload / Earn / Profile navigation.

**Observed source:**
- `/shorts` mounts `ProductionHeader` and `FullscreenVideoFeed`.
- `VerticalVideoFeed` supports an `activeTab` prop with `foryou` and `following`; its filtering logic uses the signed-in user's `users/{uid}/following` list. However `/shorts/page.tsx` fixes the tab with `useState("foryou")` and exposes no setter or visible For You / Following control. So the filter exists but the user cannot switch to it from this page.
- `ProductionHeader` shows Jembee Shorts branding, Search, Friends and Notifications. It does not show the For You / Following selector or a coin indicator shown in the screenshot.
- `BottomQuickActions` currently shows Home / Explore / Upload / Share / Profile. Its Home handler opens `/videos`, and `/videos` redirects back to `/shorts`; the bottom Home action therefore loops back to Shorts. The reference calls for Earn / Rewards in the fourth position.
- The code has a Reward Center route (`/videos/reward-center`) that reads the user's `walletBalance`, but this is not the current bottom-nav destination and is not proof of reward eligibility/settlement correctness.
- If no videos are available, `VerticalVideoFeed` has an explicit empty-state view rather than leaving a black video area.

**Traceability findings:**
- `R02-FORYOU-FOLLOWING`: Following feed filter exists in code, but no UI switch is exposed — `PARTIAL`.
- `R02-COIN-ENTRY`: screenshot coin entry is not present in the current Shorts header — `FAIL` (reward availability must still be backend-gated).
- `R02-RIGHT-ACTIONS`: like/comment/share/save/more and mute controls exist in the feed action layer — `PARTIAL` (save persistence and menu contents are tracked under REF-03).
- `R02-NAV-LABELS`: fourth bottom-nav item is Share instead of Earn/Rewards — `FAIL`.
- `R02-HOME-DESTINATION`: Home action routes to `/videos`, which redirects to `/shorts` — `FAIL`.
- `R02-EMPTY-STATE`: a visible empty state is implemented — `SOURCE PRESENT; runtime test pending`.

**Acceptance tests required:**
1. The For You and Following controls are visible, keyboard/touch accessible, preserve the selected tab, and update the feed without resetting playback incorrectly.
2. Following only returns safe, approved videos from creators actually followed by the current user; guest/no-following states show an understandable empty state.
3. Feed swipe changes one item at a time, pauses previous playback, starts only the active item, handles slow/error media and does not auto-download entire videos.
4. Reward/coin entry is visible only when the reward ledger/eligibility source is active and server-backed.
5. Each action rail button invokes the matching operation, updates its state after server success and handles auth/error states.
6. Bottom navigation contains the approved five destinations and each destination opens the intended route.

### REF-03 — Three-dot Options Sheet

**Image intent:** the real three-dot sheet contains Interested, Not interested, Save, Playback speed, Why you're seeing this post, Report, Share and Block this channel. The image also shows the bottom navigation below the sheet.

**Observed source:**
- `ShortsMenuSheet.tsx` currently contains Interested, Not interested, Save, Playback speed, Why you're seeing this post and Report.
- Share exists as a separate right-side action in `VideoActions.tsx` / `VerticalVideoFeed.tsx`, with a server-authenticated share-attribution attempt and a share recording call. It is not included as a row inside the sheet.
- No Block channel action/handler or corresponding block-channel route was found in the inspected source tree.
- The current `onSave` handler in `VerticalVideoFeed.tsx` toggles only local React state (`savedVideos`). The repository has a saved-video helper and a profile API that reads `savedWatchVideos`, but this Shorts handler does not call that persistence helper; the on-screen Save action is therefore not shown to persist to the library from this flow.
- Report, Interested and Not interested handlers are wired to existing service calls; playback speed is passed to the player; Why you're seeing opens a local modal.

**Traceability findings:**
- `R03-INTEREST`: handler and service call present — `SOURCE PRESENT; runtime test pending`.
- `R03-NOT-INTERESTED`: handler and service call present — `SOURCE PRESENT; runtime test pending`.
- `R03-SAVE`: visible action exists but the inspected handler only toggles local state; persisted Library behavior is not wired here — `FAIL`.
- `R03-SPEED`: sheet offers 0.5x / 1x / 1.5x / 2x and calls the speed handler — `SOURCE PRESENT; player runtime test pending`.
- `R03-WHY`: callback opens a modal — `SOURCE PRESENT; content/UX test pending`.
- `R03-REPORT`: reason list and report handler exist — `SOURCE PRESENT; API test pending`.
- `R03-SHARE-IN-SHEET`: separate right-side share works through a share handler, but the sheet row shown in the reference is absent — `FAIL` for visual/action placement.
- `R03-BLOCK`: no block control or matching handler/API found — `FAIL`.

**Acceptance tests required:**
1. Opening More displays all eight rows from the reference in the intended order and is distinct from the right-side quick Share control.
2. Share row opens the platform share sheet or safe clipboard fallback and preserves the approved-video share/attribution flow.
3. Block this channel requires a clear confirmation, persists a user-scoped block relationship, removes that creator's content from future feeds, and can be managed/unblocked from an appropriate account screen.
4. Save writes to the authenticated user's saved-video collection and remains saved after reload/device change; unsave removes it.
5. Interested/Not interested, Report and Why-seeing paths provide clear success/error/recovery feedback and cannot silently fail.
6. Playback speed updates the actual active player and is reset/retained according to the approved product behavior.

### REF-04 — Shorts Before/After Bottom Navigation

**Image intent:** remove the incorrect extra options-like bottom strip that hides/replaces navigation; restore the five-item bottom bar Home / Explore / Upload / Earn / Profile. Keep the legitimate three-dot Options sheet.

**Observed source:**
- `VerticalVideoFeed` renders `BottomQuickActions` and a separate `ShortsMenuSheet` via `VideoActions`.
- There is one `ShortsMenuSheet` component in the inspected Shorts action path; no second duplicate navbar-options component was found in this source trace.
- The sheet CSS uses `bottom: 150px` and a very high z-index; the nav is fixed at the bottom with z-index 50. This positioning appears intended to leave room for the nav, but an Android browser/device screenshot is required to prove the exact result.
- Fourth nav item remains Share, and Home still loops back to Shorts as described above.

**Traceability findings:**
- `R04-NAV-VISIBLE`: separate nav and sheet components exist, but exact device layering is unverified — `DEVICE TEST PENDING`.
- `R04-NO-DUPLICATE-SHEET`: static search found one active options sheet component in the path — `SOURCE PRESENT; runtime test pending`.
- `R04-APPROVED-DESTINATIONS`: labels and Home route do not match approved reference — `FAIL`.

**Acceptance tests required:**
1. On supported Android viewport sizes, open/close the three-dot sheet and verify the five-item nav remains visible and tappable, without overlap or an extra duplicate strip.
2. Verify the Options sheet closes by X, back gesture/back button and outside interaction if specified; after closing, the original nav remains stable.
3. Verify Home opens the actual Home feed, Explore opens Explore, Upload opens upload, Earn opens Reward Center, and Profile opens Profile.

### REF-05 — Second Bottom Navigation Comparison

**Image intent:** a second comparison of the same bottom navigation restoration and options-sheet behavior.

**Observed source:** same component path and state as REF-04. No separate implementation was found for this second comparison.

**Acceptance tests:** execute all REF-04 tests again at the second supplied viewport/screenshot framing, including options sheet open and closed. This reference is not counted as a separate feature implementation; it is a second visual regression case.

## 4. Requirements without supplied final screenshots

| Area | Functional requirements in Master Plan | Visual reference status | What is needed to close visual mapping |
|---|---|---|---|
| School Learning | Board/Pattern → School → Class → Subject → Book → Chapter → Topic/Question → related videos; CRUD, stable IDs, search, pagination, Free/Paid, approved teacher lessons | `NOT SUPPLIED` | User-approved screenshots of every hierarchy level and the admin catalog workflow |
| Android Mobile | video/Shorts/Learning-first; upload/profile/search/notifications/eligible earnings; permissions/deep links/offline opt-in | `NOT SUPPLIED` | User-approved mobile app Home, Shorts, Player, Search, Profile/Login and Download screens |
| Android TV / Google TV | landscape UI, D-pad focus, TV player, remote key mapping, paid entitlement, secure casting | `NOT SUPPLIED` | user-approved TV Home, nav focus, player, search, login/profile and error states |
| Creator / Teacher / Sharer earnings | dashboards, analytics, qualifications, lesson mapping, referral attribution | `NOT SUPPLIED` | final dashboards if exact visual matching is required |
| Admin ads / settlement | placements, network controls, ledger/split/refunds/reconciliation | `NOT SUPPLIED` | final admin screenshots if exact visual matching is required |

## 5. Cross-reference decision register — resolve before UI/code changes

These are implementation decisions, not choices silently made by this audit:

1. **Earn tab target:** proposed candidate is `/videos/reward-center` because that route exists; confirm whether it is the intended destination for the bottom Earn/Rewards item.
2. **Share row:** reference explicitly includes Share in the Options sheet as well as the right-rail Share action. Keep both, with the same safe share flow, unless the user approves a different behavior.
3. **Block channel:** define whether blocking hides creator videos/comments/profile and whether user can later manage/unblock. A server-side user-scoped relationship and authorization rules will be needed; no implementation is inferred.
4. **Save semantics:** decide that Save must persist to the existing `savedWatchVideos` collection and appear in Library/Profile; current Shorts local state is insufficient.
5. **Home/watch destination:** identify the canonical video watch route for a video card. `/videos/original/[videoId]` presently means original/derived video, not the complete generic watch page shown in REF-01.
6. **Reward visibility:** coin counts/Watch & Earn should only show from a verified backend ledger/eligibility mechanism; do not use sample balances.

## 6. Phase 2 exit criteria

Phase 2 can move to `TESTING` only when:
- every supplied screenshot has a stable Reference ID and its intended route/component is confirmed;
- all observed differences have a discrepancy ID and acceptance test;
- missing reference sets for School Learning and TV are explicitly supplied or accepted as functional-only scope;
- unresolved behavior decisions above are approved;
- responsive browser/device screenshots are captured against the accepted references.

**Current Phase 2 status:** `IN_PROGRESS`. Static traceability for the five supplied images is recorded. Pixel-level/device acceptance is not run. No source code was changed.
