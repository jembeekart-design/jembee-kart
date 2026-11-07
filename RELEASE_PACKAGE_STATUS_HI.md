# Jembee Shorts — Full Source Package

तैयार करने की तारीख: 7 नवम्बर 2026

## पैकेज में क्या है
- Jembee Shorts का पूरा उपलब्ध `src/` application source
- `public/` assets और video/model resources
- Firebase Firestore/Storage rules, indexes और Firebase configuration
- API routes, admin pages, creator/video workflows और संबंधित libraries
- उपलब्ध Node contract tests और project documentation
- Paid video checkout, Cashfree webhook, settlement ledger, refunds, attribution, teacher referral और expense evidence से संबंधित उपलब्ध source/tests

## इस पैकेज पर किए गए checks
- 19 lightweight Node contract-test files चलाए गए: 84 tests पास, 0 fail.
- Archive को `unzip -t` से verify किया गया.
- ZIP में `node_modules`, Next build output/cache, TypeScript build cache, local env files और private credential files शामिल नहीं किए गए.

## सीमाएँ — production-ready प्रमाणपत्र नहीं
इस runtime में Next.js, TypeScript और Firebase CLI executables उपलब्ध नहीं थे। इसलिए full TypeScript type-check, ESLint, Next.js production build और Firebase Emulator rules tests नहीं चलाए गए। Cashfree sandbox/live payment, webhook provider delivery, Google Drive OAuth/service-account integration, Meta WhatsApp delivery और Android Mobile/Android TV device tests भी इस package run में प्रमाणित नहीं हुए।

Paid video checkout/live payments, creator/sharer/platform settlement और payouts को production में enable न करें जब तक provider credentials/configuration, webhook signatures, Firebase rules emulator, refund reconciliation, ledger reconciliation और end-to-end tests वास्तविक environment में pass न हों। कोई भी payout या viewer coin reward इस ZIP से स्वतः enable नहीं होता।

## उपयोग से पहले
1. ZIP को नई directory में extract करें.
2. `.env.example` उपलब्ध हो तो उसकी मदद से आवश्यक environment variables सुरक्षित तरीके से configure करें; secrets को source/ZIP/GitHub में commit न करें.
3. सही Firebase project और rules को staging environment में configure करके emulator tests चलाएँ.
4. Dependencies install करके type-check, lint, production build और end-to-end tests चलाएँ.
5. Android TV के लिए अलग native app/source उपलब्धता और physical device validation करें.
