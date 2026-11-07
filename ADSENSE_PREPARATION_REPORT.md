# Jembee Shorts — AdSense preparation patch (2026-11-07)

## Changes in this package
- Added a public `/about` page.
- Replaced Firestore-dependent `/contact` and `/terms_conditions` public pages with static, readable pages so they do not become blank/unavailable when Firestore is unavailable.
- Updated `/privacy` with third-party advertising, Google AdSense cookies, consent, settings, and children's privacy disclosures.
- Updated sitemap to include the public Shorts information pages and removed unrelated shop/MLM URLs.
- Kept Monetag integration and its existing admin kill switch unchanged. Monetag must remain enabled until the replacement system is implemented and tested.

## Not certified / still required before AdSense application
1. Confirm the actual production domain and set `NEXT_PUBLIC_SITE_URL` to that exact HTTPS origin. The existing fallback domain is retained only to avoid inventing the live domain.
2. Verify the public site is reachable without login, including `/about`, `/contact`, `/privacy`, `/terms_conditions`, `/ads.txt`, and `/robots.txt`.
3. Verify original, substantial, policy-compliant public content is available to crawlers. A source-code review cannot establish content quality or ownership.
4. Confirm the publisher ID and `ads.txt` seller record belong to the account that will apply.
5. Add and validate a consent-management solution where required for the site's audience/regions.
6. Run dependency installation, lint, TypeScript checks, production build, and deployed browser tests. These have not been run in this packaging step.
7. Review user-generated content moderation, copyright reporting, child-safety controls, and invalid-traffic safeguards.

## Important
This is an AdSense preparation patch, not a guarantee of AdSense approval. No live ad behavior was enabled or altered. The AdSense script remains as it was in the source package, and the manual/auto ad components remain test-gated.
