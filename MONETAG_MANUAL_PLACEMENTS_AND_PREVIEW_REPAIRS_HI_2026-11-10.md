# JEMBEE PLAY — Monetag Manual Placements और Preview Audit Repairs

**तारीख:** 10 नवंबर 2026  
**आधार:** JEMBEE PLAY ESLint Repair Stage 2 source  
**स्थिति:** source ZIP तैयार; नया Vercel deployment अभी नहीं किया गया।

## 1. Monetag अब कहाँ और कैसे दिखेगा

इस source में global Monetag script, MultiTag/auto-tag और समय-आधारित floating ad serving बंद हैं। Google AdSense auto script भी root layout से हटाया गया है। Shorts/full-screen feed और School Learning में कोई Monetag slot नहीं रखा गया है।

Monetag के automatic formats (जैसे OnClick, In-Page Push और Vignette) exact page element में सीमित नहीं रहते। इस implementation में Monetag Direct Link / Smart Link को Admin-enabled sponsored card के button से जोड़ा गया है। Ad अपने-आप नहीं खुलेगा; user को button दबाना होगा। Monetag Help Center में Direct Link को hyperlink/button/image/text में लगाने का तरीका बताया गया है:

- https://help.monetag.com/en/articles/6753447-direct-link
- https://help.monetag.com/en/articles/6753446-how-to-add-monetag-scripts

### Admin में ad लगाने का तरीका

1. Monetag Publisher Dashboard में JEMBEE PLAY website के लिए Direct Link / Smart Link प्राप्त करें। Script/JavaScript snippet नहीं, पूरा HTTPS link कॉपी करें।
2. JEMBEE PLAY Admin → **Ads Manager** खोलें।
3. **Add placement** दबाएँ और exact location चुनें:
   - Home · after the learning banner
   - Home · after the video grid
   - Explore · below categories and featured links
   - Videos · below the video library
4. Smart Link URL, sponsored title, छोटा description और button text भरें।
5. Preview के लिए **Test / Preview** environment चुनें। Production environment केवल Production release के बाद अलग से चुनें।
6. पहले OFF रखकर Save करें; जाँच के बाद ही **Enable this exact placement** ON करें।

Preview deployment में केवल `test` slots और Production में केवल `production` slots लौटेंगे। Duplicate placement/environment को Admin UI रोकता है। Server endpoint fixed allowlist, `enabled`, provider, format, environment और HTTPS URL सभी जाँचता है।

**महत्वपूर्ण:** जब तक Admin Monetag Smart Link नहीं डालता और slot enable नहीं करता, page पर कोई ad नहीं दिखेगा। यह implementation manual sponsored card है; automatic banner impression नहीं। Direct Link की वास्तविक Monetag earnings/attribution को इस code test से प्रमाणित नहीं माना गया है।

## 2. लागू source fixes

- MonetagScriptGate अब global scripts load नहीं करता; legacy global status endpoint हमेशा disabled लौटाता है।
- Legacy Admin global toggle से auto-serving ON नहीं हो सकती।
- Root layout से AdSense auto script हटाया गया। Legacy GAM/AdSense script provider adapter अब script inject नहीं करता।
- Admin Ads Manager को पुराने generic/Google Ads campaign form से हटाकर Monetag manual placement manager पर केंद्रित किया गया।
- Shorts के timed floating campaign ads बंद किए गए; Shorts/full-screen feed में Monetag auto placement नहीं है।
- Public `/api/ads/placements` endpoint केवल exact allowlisted, Admin-enabled Monetag Direct Link slot लौटाता है।
- Home और Videos Library अब sample/demo video cards की जगह existing approved, active, safe, free Firestore video query का उपयोग करते हैं।
- `/videos` अब `/shorts` पर redirect नहीं होता; अलग video library दिखाता है। `/videos?v=<videoId>` route selected video deep-link खोलने के लिए feed को वही video ID देता है।
- Explore में Master Plan की 20 categories रखी गई हैं।
- School Learning से काल्पनिक demo school names और demo video-answer cards हटाए गए हैं। अभी verified school directory, Firestore CRUD और question-to-video mapping connect होना बाकी है; इसलिए page अब नकली records नहीं दिखाता।
- Terms & Conditions से पुराने JembeeKart shopping, shipping, product और referral/network clauses हटाकर JEMBEE PLAY video-service draft Terms रखा गया है। इसमें legal review की चेतावनी दिखाई जाती है।
- Google Drive thumbnail, stream, upload, completion और OAuth paths में raw Google/Gaxios error objects, stack/message logging को safe error-code classification से बदला गया है। इससे OAuth refresh token या client credential वाले nested request data के logs में जाने का जोखिम घटता है।

## 3. Vercel/Google Drive blocker — अभी external action बाकी

10 नवंबर 2026 को connected Vercel project `jembee-kart` की environment-variable **names/targets** जाँची गईं; secret values नहीं पढ़े गए। Preview runtime logs में पहले यह error मिला था:

`invalid_grant — Token has been expired or revoked`

Environment listing में `GOOGLE_OAUTH_REFRESH_TOKEN` केवल Preview target पर था और `GOOGLE_OAUTH_TOKEN_ENCRYPTION_KEY` variable मौजूद नहीं था। इस source में encrypted Firestore token storage के लिए 32-byte (64 hexadecimal character) encryption key आवश्यक है। इसलिए केवल नया OAuth consent पूरा करना पर्याप्त नहीं होगा जब तक यह key Vercel में configured न हो।

### Admin को करना होगा

1. अपने सुरक्षित local Termux shell में एक बार key बनाएँ:

   ```bash
   node -p "require('node:crypto').randomBytes(32).toString('hex')"
   ```

2. निकली हुई 64-character value को ChatGPT/chat, ZIP, GitHub या logs में paste न करें। Vercel Project → Settings → Environment Variables में `GOOGLE_OAUTH_TOKEN_ENCRYPTION_KEY` नाम से **एक ही value** Preview और Production दोनों targets के लिए configure करें। दोनों environments में समान key जरूरी है क्योंकि encrypted token Firestore में साझा document में रखा जाता है।
3. Admin → Moderation → **Connect Google Drive** से OAuth दोबारा authorize करें। Google OAuth redirect URI वही होना चाहिए जो Vercel environment और Google Cloud OAuth client में registered है।
4. Successful callback के बाद एक approved test video का thumbnail, stream और upload जाँचें। पुराना revoked Preview refresh-token env fallback तभी हटाएँ जब encrypted Firestore token save/read successfully verify हो जाए।

यह ZIP केवल error handling सुरक्षित करती है; नया Google token generate/rotate नहीं करती और न ही Vercel secrets बदलती है।

## 4. बाकी known limitations

- School Learning का पूरा Firebase-backed Board → School → Class → Book → Subject → Chapter → Question CRUD और Admin merge/verification अभी अधूरा है।
- Teacher upload workflow और वास्तविक school/question mapping इस patch में नहीं जोड़े गए।
- Monetag Direct Link card का वास्तविक ad click/earnings account से test करना बाकी है; कोई Smart Link इस ZIP में hardcode नहीं है।
- Terms & Conditions एक draft है; Production से पहले Indian legal professional से review आवश्यक है।
- Google Drive को reconnect करने और external Firebase/Drive/Cashfree operations को live verify करने के लिए owner/admin action चाहिए।

## 5. Verification इस ZIP में

- Node contract tests: **90/90 PASS** (24 test files)
- TypeScript/TSX syntax parse: **305 files, 0 syntax errors**
- Full project TypeScript semantic check: इस build environment में dependencies install timeout होने के कारण दोबारा पूरा नहीं चला।
- ESLint: इस patch के बाद पूरा rerun नहीं हुआ। पिछली Stage 2 ZIP पर user के Termux output में 0 ESLint errors और 100 warnings थे; उस परिणाम को इस नई ZIP का परिणाम नहीं माना गया है।
- Next.js production build: इस patch के बाद rerun नहीं हुआ। पिछली Stage 2 ZIP पर user के Termux output में `BUILD_EXIT_CODE=0` था; यह नई ZIP का build result नहीं है।
- Vercel Preview: पहले वाला Stage 2 deployment READY था; यह नई repaired source ZIP अभी deploy नहीं की गई है।

## 6. Termux verification commands

ZIP extract करने के बाद project root में चलाएँ:

```bash
npm ci --no-audit --no-fund
./node_modules/.bin/tsc --noEmit --incremental false --pretty false
./node_modules/.bin/eslint src
export NODE_OPTIONS="--max-old-space-size=4096"
export NEXT_TELEMETRY_DISABLED=1
npm run build
```

या Node 22.x पर `bash scripts/verify-release.sh` चलाएँ। यह script external Firebase/Google Drive/Cashfree/ad-network connectivity को certify नहीं करती।
