# JEMBEE PLAY — ZIP के बाद क्या करें

1. इस ZIP को extract करें; project folder `JEMBEE_PLAY` होगा।
2. Ubuntu/Termux में Node.js 22.x चुनें और project folder में जाएँ।
3. `.env.example` को `.env.local` में copy करके केवल अपने private Firebase/Drive/Cashfree values भरें। Real credentials chat या GitHub पर न भेजें।
4. `npm ci` चलाएँ। यदि npm registry DNS error दे तो उसी network पर बाद में retry करें।
5. `bash scripts/verify-release.sh` चलाएँ। यह 103 Node contract tests के बाद install, TypeScript, ESLint और Next.js build gate चलाता है। Build के लिए 4096 MB Node heap अपने-आप set होता है।
6. Build और target Firebase Emulator rules tests पास हुए बिना deployment या paid checkout/payout enable न करें।

## ईमानदार स्थिति
यह package complete production release नहीं है। 19-phase matrix में हर phase का status और बाकी कार्य दिए हैं। Android Mobile/TV के native projects अभी इस source में नहीं हैं; School Learning CRUD और Admin-controlled ad integration भी अधूरे हैं।
