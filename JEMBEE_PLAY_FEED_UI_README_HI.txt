JEMBEE PLAY — Home Feed UI Patch (10 Nov 2026)

इस patch में:
1. Home पर Shorts का responsive 9:16 grid और Long Videos का 16:9 feed अलग किया गया है।
2. Long Video tap करने पर native controls वाला landscape player खुलता है; preload="none" रखा गया है।
3. Upload form में Shorts / Long Video selection जोड़ा है। Video format और local duration metadata upload -> moderation -> approval -> Firestore तक जाते हैं।
4. पुराने records जिनमें videoFormat नहीं है, उन्हें legacy Shorts माना जाता है क्योंकि पुराना upload flow Shorts-only था।
5. Creator email को public display label की जगह नहीं दिखाया जाएगा।
6. Monetag Admin form में advertiser name, creative image URL और logo URL जोड़ने की सुविधा है। Public Sponsored card केवल admin-enabled allowlisted placement पर दिखता है और user click पर Direct Link खोलता है।
7. Home पर learning banner के बाद, Shorts के बाद और Long Videos के बाद manual ad slots उपलब्ध हैं।
8. Thumbnails के पहले चार Short cards और पहले तीन Long cards eager/high priority से load होंगे; video file auto-download नहीं होगी।

Apply:
- इस ZIP को project root पर extract करें (जहाँ package.json है), overwrite allow करें।
- Dependencies नहीं बदली गईं; existing node_modules के साथ npm ci जरूरी नहीं है।
- पहले TypeScript, ESLint, focused tests और production build चलाएँ। Commands report में हैं।

महत्वपूर्ण सीमाएँ:
- Monetag Direct Link अपने-आप advertiser artwork, rating, या दो अलग Watch/Install destinations नहीं देता। Creative image और logo Admin को HTTPS URLs से भरना होगा; rating/dual CTA नहीं गढ़े गए।
- अभी Google Drive OAuth refresh-token error की पिछली runtime रिपोर्ट थी। यह UI patch credentials को ठीक नहीं कर सकता। वास्तविक Drive thumbnails और playback के लिए Preview environment में Google OAuth को re-authorize करना होगा।
- Legacy video records में duration metadata नहीं है; नया upload duration save करेगा।
- इस environment में npm ci timeout हुआ, इसलिए final TypeScript, ESLint और Next production build इस ZIP के लिए confirm नहीं किए गए। Node contract tests और TS/TSX syntax parsing पास हुए हैं।

यह patch Cashfree files को modify नहीं करता और कोई production deployment नहीं करता।
