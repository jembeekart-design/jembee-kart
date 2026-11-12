# JEMBEE PLAY – UI Design Package (Hindi)

यह पैकेज 58 अलग-अलग page concepts का responsive preview देता है। हर पेज के लिए Mobile और Desktop/Web preview उपलब्ध है। Video, Shorts, Learning और Android TV अनुभव के लिए चुने गए 22 screens में TV preview भी उपलब्ध है।

## इस revision में सुधार

- Comments/Replies, Watch History, Following/Followers, Subscriptions, Playlists, Downloads, Notifications, Help Center और Referral/Rewards के अलग layout patterns।
- Board, School, Class, Subject, Book, Chapter और Course के अलग learning layouts।
- TV Pairing Login, TV Search keyboard, TV Settings और TV My List के अलग TV layouts।
- Creator, Teacher, Sharer, Earnings और Payment pages के अलग metric labels।
- Upload file selector और Account Deletion warning/confirmation preview।
- Offline preview के लिए local SVG thumbnails।
- 6 catalog contract tests।

## सुरक्षा और सीमा

- Admin Panel का design नहीं बदला गया।
- Firebase rules, authentication, APIs, moderation और settlement logic में बदलाव नहीं किया गया।
- ये preview actions वास्तविक Firebase/API writes नहीं करते।
- Production routes को इन previews से replace नहीं किया गया।
- Dependencies उपलब्ध न होने के कारण Next.js build और full TypeScript check verify नहीं हुए।

## Tests

`node --test src/lib/ui-design/__tests__/catalog-contract.test.mjs`

Expected: 6 tests pass.
