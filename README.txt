JembeeKart Monetag dashboard patch

File:
src/app/mlm/watch-earn/profile/page.tsx

Apply from the root of ~/jembeekart:
unzip -o JembeeKart_Monetag_Dashboard_Patch.zip -d .

Then run:
NODE_OPTIONS="--max-old-space-size=4096" npx tsc --noEmit

Important limitation:
This patch displays existing confirmed uploader/sharer earnings and payment records for the logged-in user. It does not fabricate individual attribution from Monetag aggregate/zone statistics. True per-share revenue allocation requires a verified per-share impression/revenue signal from Monetag or a documented supported sub-ID reporting feature, plus server-side attribution and deduplication.
