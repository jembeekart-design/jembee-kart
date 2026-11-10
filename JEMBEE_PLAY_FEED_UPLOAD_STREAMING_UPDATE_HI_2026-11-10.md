# JEMBEE PLAY — Feed, Playback, Monetag और Upload UI Update

**Package:** `JEMBEE_PLAY_Feed_Playback_Ads_Upload_Refinement_2026-11-10.zip`  
**Base source:** Feed UI branch `test/monetag-feed-ui-2026-11-10`, commit `77ac521d5e958eb8432dc977db484390e89a5245`  
**Scope:** Source package only. इस पैकेज से GitHub या Vercel पर कोई deployment/push नहीं किया गया है।

## किए गए बदलाव

### 1. Video playback और streaming
- Shorts और Long Video player अब approved Drive video के लिए `/api/shorts/video-stream/{videoId}` route इस्तेमाल करते हैं।
- Active video को high fetch priority दी गई है; बाकी feed items metadata-only preload करते हैं।
- Server हर range response को अधिकतम 4 MB तक सीमित करता है; no-Range शुरुआती request भी केवल पहला bounded segment लौटाती है।
- Free/public approved segments browser में 30 सेकंड तक private cache हो सकते हैं। Paid playback `private, no-store` ही रहता है और purchase-cookie validation बरकरार है।
- Feed thumbnails के existing visible/current + अगले चार items वाले preload व्यवहार को नहीं बदला गया। पूरा video auto-download/cache करने का नया code नहीं जोड़ा गया।

### 2. Monetag ad placement
- Home के Admin-defined तीनों slots पर neutral reserved ad-space placeholder दिखता है, भले slot अभी enabled न हो।
- Placeholder पर advertiser, image, CTA या click URL नहीं होता; इसलिए यह fake ad नहीं है।
- वास्तविक Monetag card तभी दिखता है जब Admin का उसी location और environment के लिए enabled Direct Link slot API से लौटता है।
- Global tags, popunder/redirect या Shorts के बीच timed ads नहीं जोड़े गए।

### 3. Shorts grid
- Home page पर अब अधिकतम चार Shorts दिखते हैं।
- Grid दो columns में रहता है, यानी मोबाइल पर दो rows × दो Shorts।

### 4. Upload page
- Upload page को black/dark theme, white readable text और simple solid-blue buttons के साथ नया layout दिया गया।
- Step 1–2–3 guide, video picker, selected-file preview, metadata fields, tips और पाँच-item bottom navigation शामिल हैं।
- Google Drive progress card में percentage और uploaded/total MB दिखते हैं।
- Pause/resume वर्तमान 2 MB resumable chunk के बाद लागू होता है; Cancel active request abort करके moderation session cleanup request करता है।
- मौजूदा Google Drive OAuth/resumable upload pipeline बरकरार है। 500 MB limit नहीं बदली।

## Existing backend सीमा

इस source के existing upload data contract में title/caption, Shorts/Long format, Free/Paid access और Drive-generated thumbnail का flow मौजूद है। Separate category, audience/visibility और user-uploaded thumbnail के लिए end-to-end persistence/approval path इस branch में मौजूद नहीं था; इसलिए UI में ऐसे दिखावटी controls नहीं जोड़े गए जो save नहीं होते। Drive thumbnail workflow ही रखा गया है।

## किए गए checks

- `test:home-feed`: 13/13 passed
- `test:video-playback-smoothing`: 2/2 passed
- `test:shorts-page`: 4/4 passed
- `test:video-preload-cache`: 3/3 passed
- कुल targeted Node tests: **22/22 passed**
- Modified TS/TSX files की TypeScript transpile/syntax check: **10 files, 0 syntax errors**

## अभी नहीं किए गए checks

इस packaging environment में project `node_modules` मौजूद नहीं थे। इसलिए full TypeScript type-check, ESLint और full Next.js production build यहाँ run नहीं किए गए। Termux/Ubuntu में ZIP extract करने के बाद `npm ci`, फिर `npx tsc --noEmit --incremental false --pretty false`, `npm run lint`, और `npm run build` चलाएँ।

## लागू करने से पहले

1. अपना verified current project backup रखें।
2. ZIP को clean folder में extract करें और project root verify करें।
3. ऊपर दिए TypeScript/ESLint/build checks pass कराएँ।
4. पहले Vercel Preview deploy पर upload, pause/resume/cancel, Shorts playback, Long playback और तीनों Home ad slots test करें।
5. Preview verification के बाद ही Production deploy करें।
