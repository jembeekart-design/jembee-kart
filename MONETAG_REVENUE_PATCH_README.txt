JembeeKart Monetag Revenue CSV Import Patch (v2)

Included file:
  src/app/api/admin/monetag-revenue/route.ts

What it does:
- Admin-only GET lists site-level Monetag revenue reports.
- Admin-only POST accepts JSON: { "csvText": "<entire Monetag CSV text>", "siteId": "jembeevideo" }.
- Parses the Monetag semicolon-delimited Date;Impressions;Profit;CPM CSV (also comma delimiter).
- Imports daily rows only; ignores the final total row with an empty Date.
- Treats Profit and CPM as USD because the supplied Monetag dashboard shows "$".
- Calculates site-level pools: 20% sharer, 30% uploader, 50% platform.
- Re-importing an identical date/report is idempotent; a different value for an existing date returns conflict rather than overwriting.

IMPORTANT LIMITS:
- This is a revenue-report import endpoint, not an automatic Monetag API integration.
- It does NOT provide a CSV upload screen yet; an authenticated admin client must POST csvText with a Firebase ID token.
- The supplied CSV contains only site-level daily totals. It does not identify individual sharers/videos/uploaders.
- Pool amounts are not user-level earnings and must not be credited to wallets. Per-user estimates need separate, defensible attribution and must reconcile to the pools.
- No video feed, upload, playback, wallet, or MLM files are included or changed.

Install from the repository root:
  unzip -n ~/storage/downloads/JembeeKart_Monetag_Revenue_Import_Patch_v2.zip -d .
  npx tsc --noEmit --pretty false

Do not deploy before review/testing. Existing report documents in monetagRevenueReports may have the old INR schema; inspect/backup those before using this USD-based schema.
