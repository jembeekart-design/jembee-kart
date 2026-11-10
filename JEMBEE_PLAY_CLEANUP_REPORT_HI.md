# JEMBEE PLAY — सफाई रिपोर्ट

इस पैकेज से पुराने Cart, Checkout, Orders, Products, Inventory, Shipping, Seller, Affiliate और network-commission modules हटाए गए हैं।

## सुरक्षित रखे गए वीडियो फीचर
- Shorts feed, creator upload और public creator profile
- Google Drive OAuth, resumable upload और secure video streaming
- Video moderation, comment moderation, likes, reports और notifications
- School Learning और education admin page
- Cashfree paid-video order/verification/webhook, purchase entitlement और refund reconciliation
- Monetag video revenue, share attribution और Shorts expense evidence
- Creator settlement ledger और payout-review page (live payout disabled)
- Android/mobile video-app settings

## इस सफाई में जो अतिरिक्त सुरक्षा सुधार हुआ
Paid playback-session endpoint जोड़ा गया है। यह Firebase ID token verify करता है, approved/active/safe paid video और उसी user की non-revoked purchase जाँचता है, फिर video-scoped HttpOnly Secure cookie जारी करता है।

## जाँच परिणाम
- 68 Node contract/unit tests: सभी पास (68/68)।
- Local import-path scan: कोई missing relative या alias import नहीं मिला।
- Shopping/network-commission route scan: कोई पुराना app/API route नहीं मिला।

## जरूरी सीमाएँ
यह ZIP source-level cleanup है। npm dependency installation समय-सीमा में पूरा नहीं हुआ, इसलिए TypeScript और Next.js production build नहीं चल सके। वास्तविक Firebase/Cashfree/Google Drive credentials के बिना live payment, upload, moderation और production deployment प्रमाणित नहीं हैं। इसे production-ready न मानें। Live payouts बंद रखें।


## JEMBEE PLAY Video-Only Scope Confirmation — 2026-11-09

The current implementation source is being kept within the JEMBEE PLAY video-first scope. This cleanup removes legacy profile sponsor-tree, rank/package and multi-level commission initialization from newly created accounts. It does not bulk-delete existing Firebase user documents or historical records.

Preserved: per-video share attribution (`monetagShareAttributions` / `monetagShareClaims`), the independent Teacher Referral 2% ledger, paid-video Cashfree purchase/entitlement/refund routes, Creator video earnings and reward balances. These are not shopping or MLM flows.

UI residue removed from the active source: product/cart examples from the admin theme preview, seller/affiliate/premium-member push audience options, a JEMBEEKart shopping redirect, old external watch URL in the legacy share drawer, and the old shop domain from the default comment-domain allowlist.

Historical user Firestore records and Firebase collections are not migrated or deleted by this source cleanup. Existing records require a separate, backed-up migration plan if the production database is ever to be purged of legacy commerce/MLM fields.

## Video-only source cleanup — अतिरिक्त update, 09-11-2026

इस अलग cleaned source copy में Shopping/MLM से जुड़े सक्रिय user journey और UI remnants की सफाई की गई:

- नए user profile से sponsor tree, parent chain, package, rank, downline, MLM level counters और product/order counters हटाए गए।
- Signup/Login से legacy JBK sponsor-code capture हटाया गया।
- Unused legacy multi-level registration helper modules और exports हटाए गए।
- Admin theme preview, notification audiences, roles, support ticket examples, app settings और storage placeholder को JEMBEE PLAY के video roles/features के अनुरूप किया गया।
- पुराने JembeeKart shopping promotion/redirect links हटाए गए।
- Shorts में active video और अगले चार eligible videos के metadata preload को सीमित किया गया; unauthorized paid video को preload नहीं किया जाता।

**सुरक्षित रखे गए:** Google Drive video upload/moderation, paid-video Cashfree purchase/access/refund, per-video Sharer attribution, Creator 30% / Sharer 20% / Platform 50% ledger और अलग Teacher Referral 2% ledger। Video के paid order को Shopping order नहीं माना गया है।

**डेटा सुरक्षा:** Existing Firestore user documents और historical commerce/MLM records को bulk delete या migrate नहीं किया गया। यह archive source-code cleanup है; live Firebase/Drive/Cashfree data पर कोई mutation नहीं किया गया।

**Regression:** सभी Node contract/unit tests: 79/79 pass। Next.js production build, project TypeScript और ESLint अभी verify नहीं हैं क्योंकि इस environment में `node_modules/next` और `@types/node` उपलब्ध नहीं हुए; dependency installation पूरा नहीं हुआ। GitHub write integration में 403 होने के कारण कोई commit/push नहीं किया गया। Live payouts disabled ही रहेंगे।

विस्तृत विवरण: `docs/jembee-play-audit/VIDEO_ONLY_SCOPE_CLEANUP_2026-11-09.md`।
