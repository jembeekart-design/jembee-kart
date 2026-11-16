
## Shorts feed navigation correction — 16 November 2026

- Source inspection found that the Shorts page always passed `activeTab="foryou"`, so the existing Following filter in `VerticalVideoFeed` could not be selected from the UI.
- Added visible, keyboard-operable For You and Following buttons with `aria-pressed` state and connected them to the existing feed prop.
- Reused the current authenticated Following list and filtering logic; no duplicate follow backend or direct Firestore write was introduced.
- Added a Shorts page contract test for both tab actions and active state.
- Verification limitation: this change and its contract test have not yet been executed locally; no lint, typecheck, production build, browser/device test, or deployment is claimed.
