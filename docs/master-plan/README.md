# Jembee Shorts — Master Plan Package

This ZIP contains the product specification and implementation blueprint for converting the existing JembeeKart project into **Jembee Shorts**: a video-first platform with Shorts, learning categories, school/book/question discovery, creator/teacher tools, free and paid content, and controlled advertising.

## Important
- This is a **planning/specification ZIP**, not a deployable application source ZIP.
- It does not replace or modify the existing JembeeKart backup or the current `~/jembee-shorts` source tree.
- Do not upload this ZIP as if it were the runnable Next.js application. Upload it as the project plan/specification, or use it as the blueprint for implementation in the source repository.
- Preserve the existing Firebase project (`jembee-kart1`), Firestore video records, Google Drive files, and paid-video access checks.
- Never include `.env.local`, service-account JSON, OAuth tokens, private keys, or other secrets in a source ZIP or GitHub repository.

## Package contents
- `docs/MASTER_PLAN.md` — full product scope, user journeys, screens, roadmap, acceptance criteria.
- `docs/TECHNICAL_BLUEPRINT.md` — proposed data model, services, security, migration, and API design.
- `docs/ADS_AND_MONETIZATION.md` — Monetag placement and free/paid advertising rules.
- `config/categories.json` — initial editable category catalogue and subcategories.
- `config/roles-and-permissions.json` — proposed roles and permission boundaries.

## Product principle
**One app, many content categories; Shorts remains the central viewing experience.** Learning content gets structured discovery (school → class → book → subject → chapter → question), while other categories use their own relevant filters.
