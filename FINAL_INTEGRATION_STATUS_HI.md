# Jembee Shorts — Integrated Source Package Status

यह पैकेज पुराने JembeeKart source backup पर आधारित है। इसमें पुराने source modules को हटाए बिना V6 Category Foundation और Master Plan दस्तावेज़ जोड़े गए हैं।

## संरक्षित पुराने सिस्टम
- Shorts / Watch-Earn video feed और video player components
- Video upload, creator upload workflow और moderation routes
- Video sharing, likes, comments, reports और creator/profile pages
- Google Drive upload/stream/thumbnail integration code
- Firebase client/admin setup और Firestore rules/configuration
- Monetag script gate, ad routes, share attribution और earnings/revenue UI
- मौजूदा paid-video playback checks और purchase/access verification
- मौजूदा Admin, governance, analytics और अन्य पुराने modules

## जोड़ा गया
- `/explore` category discovery page
- `/shorts` branded Shorts entry page
- Circular category icons with horizontal swipe and category search
- School, Agriculture, College, Competitive Exams, Computer & AI, Skills, Animal Husbandry, Health Education, Languages, Business, Art & Craft, Sports, Music, Environment categories
- Master plan और technical blueprint (`docs/master-plan/`)
- Jembee Shorts branding, Firebase setup और handoff notes

## महत्त्वपूर्ण: अभी अधूरा / audit में सत्यापित करना है
- Explore categories अभी static UI scaffold हैं; live Firestore category catalog और School → Class → Book → Subject → Chapter → Question relational workflow पूरा implemented नहीं माना जाए।
- Teacher/school verification, teacher-wise question video counts, complete homework/exam/live-class/parent dashboard workflows को पूर्ण न मानें; इन्हें implementation backlog में रखें।
- Monetag के मौजूदा code paths मौजूद हैं; वास्तविक ad account, zone IDs, policy compliance और production delivery को runtime पर सत्यापित करना होगा।
- Google Drive folder access Service Account से अलग read-only test में सफल रहा था, लेकिन app के सभी upload/stream/thumbnail routes का OAuth से Service Account migration इस package में verified/complete नहीं माना गया है।
- Android TV UX/build/device validation बाकी है।
- Full production build और end-to-end tests इस package creation के दौरान run नहीं किए गए।

## सुरक्षित रखने के नियम
- `.env.local` और private credentials ZIP में शामिल नहीं हैं। `.env.example` केवल template है।
- Firebase project और existing Firestore records को न बदलें।
- पुराने Drive videos को re-upload/delete/move न करें।
- Paid playback authorization, purchase checks और moderation gates को bypass न करें।
- MLM/shopping source modules इस preservation package में मौजूद हैं; Jembee Shorts public navigation में इन्हें expose करना अलग scope decision है।
- Live payouts या financial settlement को audit के बिना enable न करें।

## अगला चरण
इस ZIP को अलग directory में extract करें, dependency install और full audit/build चलाएँ। सभी failures की consolidated सूची बनाकर एक remediation pass करें।
