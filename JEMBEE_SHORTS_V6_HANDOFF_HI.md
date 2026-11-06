# Jembee Shorts V6 – Hindi Handoff

## Is ZIP mein kya badla hai
- Root `/` ab `/explore` par redirect karta hai.
- Naya `/explore` responsive category discovery page: swipeable circular category icons, search, category topic panel, Shorts entry point aur Monetag placement placeholder.
- Existing `/shorts` route aur existing video feed ko jyon-ka-tyon rakha gaya hai.
- Existing Firebase, Google Drive service, moderation, paid-video checks aur Monetag script gate ko is change mein modify nahi kiya gaya.

## Bahut zaroori implementation status
Yeh V6 **category UI foundation** hai, poora education backend nahi. School/teacher/book/chapter/question records, upload metadata workflow, live classes, tests, homework, AI tutor, Android TV native app integration aur verified Monetag placements abhi implement/test nahi hue. Category cards abhi local static configuration se aate hain; Firestore se dynamic category management abhi pending hai.

## Google Drive status
Service Account se manual read-only Drive API test mein folder ke 5 MP4 files read hue the. Lekin existing application stream routes abhi OAuth-based service ko use karte hain. Is ZIP mein un routes ko Service Account par migrate nahi kiya gaya. Isliye app playback ko Drive-connected kehkar live deploy na karein jab tak stream/thumbnail/upload/moderation routes ka migration aur regression test complete na ho.

## Termux
```bash
cd ~/jembee-shorts
# Backup first, then extract this ZIP into a NEW directory for review.
npm ci
cp .env.example .env.local
# Fill secrets locally; never upload .env.local to GitHub.
npm run build
npm run dev
```

## Next implementation phases
1. Dynamic Firestore category taxonomy and school registry with canonical IDs and duplicate prevention.
2. Teacher/school verification and lesson upload metadata (class, book, subject, chapter, question, language, free/paid).
3. Search across school/book/chapter/question/teacher and teacher dashboards.
4. Drive Service Account migration for playback, thumbnail, upload and moderation, preserving approval, paid-token and purchase checks.
5. Monetag format/placement verification and admin controls; no ads inside paid lessons.
6. Tests for mobile, Android TV, authorization, Firestore rules and paid playback.
