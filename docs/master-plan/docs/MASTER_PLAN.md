# JEMBEE PLAY — Complete Master Product Plan

## 1. Vision
JEMBEE PLAY is a video-first platform. Users can watch vertical Shorts and longer lessons, discover knowledge by category, learn from verified teachers/creators, and publish free or paid content. The product scope is limited to video, learning, creator publishing and video monetization.

## 2. Main navigation
1. Home
2. Shorts
3. Explore Categories
4. Search
5. Upload / Create
6. Library (saved videos, watch history, followed creators)
7. Profile / Dashboard

Admin and moderation tools are separate protected routes, not public navigation items.

## 3. Home screen layout
- Brand header: JEMBEE PLAY, search, notifications, profile.
- Circular category rail: round icon/image, category name, horizontal swipe, optional slow auto-scroll, pause auto-scroll during touch/keyboard focus, accessible labels, reduced-motion support.
- Category rail must not rotate individual circles like a roulette; use a calm auto-moving horizontal carousel. Users can swipe manually and open an All Categories page.
- Ad slot below category rail only when an approved ad format is available and policy allows it.
- Continue Watching / Recommended Shorts / Following / Learning Picks.
- Mixed vertical video feed with category and content labels.
- Clear Free or Paid label; never imply a paid video is free.

## 4. Initial top-level categories
1. School Education
2. Agriculture
3. College & Higher Education
4. Competitive Exams
5. Computer & Technology
6. Skill Development & Vocational Training
7. Animal Husbandry & Dairy
8. Health Education & First Aid
9. Languages & Communication
10. Business & Entrepreneurship
11. Art, Music & Culture
12. Sports, Fitness & Yoga
13. Science & Discovery
14. General Knowledge & History
15. Environment & Gardening
16. Cooking & Nutrition
17. Home Skills & DIY
18. Career & Job Preparation
19. Legal & Civic Awareness
20. Kids Learning (age-appropriate, protected experience)

Admin can add, rename, reorder, disable, and feature categories without code changes. Category content and experts should be reviewed in sensitive/high-impact areas. Health/legal/financial content needs appropriate disclaimers and review policies; no diagnosis or personalized legal/financial advice claims.

## 5. Shorts and video experience
- Vertical swipe feed with play/pause, mute, captions where available, like, comment, share, save, follow creator, report.
- Support short and long-form videos with clear duration/type labels.
- Adaptive streaming/range requests, thumbnails, loading/error/retry states.
- Respect user data, device performance, Android low-memory constraints, and TV remote navigation.
- Android TV: focusable cards, D-pad navigation, large readable text, autoplay only under user-controlled settings, back behavior, and no touch-only controls.
- Keep existing approved/active/safe moderation gates and paid purchase/token checks. Fail closed when payment or entitlement state is uncertain.

## 6. Smart Learning module
### Structured hierarchy
School (optional) → class/grade → board/curriculum → book/edition → subject → chapter → question/topic → lesson/video.

Not every learning item belongs to a school. Support independent tutors, general courses, exam prep, college, and skill learning without forcing a school field.

### School directory
- Create a school record once using a normalized name plus location/official identifier where available.
- Search existing schools before allowing a new submission.
- Prevent accidental duplicates; do not merge two schools solely because their names match.
- School profile: verified status, location, board, classes, books, subjects, associated teachers, and learning content.
- Admin reviews school claims and merges duplicates with an audit trail.

### Books and chapters
- Store book title, board, class, subject, publisher/edition/year, language, and optional ISBN/catalogue identifier.
- Chapter has stable ID, chapter number/title, book edition, language, and syllabus mapping.
- Question has stable ID, question text/number, page/reference, question type, difficulty, language, and optional diagram/media.
- Avoid copying copyrighted textbook pages or full books without permission. Store metadata and teacher-created explanations; only host permitted material.

### Teacher and creator profiles
- Display name, profile photo, bio, languages, subjects, qualification/experience claims, linked schools, verification status, and published lessons.
- Verification badges must reflect actual checks, not self-assertion.
- A teacher may be independent or associated with multiple schools, subject to confirmation.
- Show chapter/question-level contribution counts and Free/Paid counts.

### Upload flow for a lesson
1. Choose category and content type (Short / Lesson / Course / Live replay).
2. Add title, description, language, age/grade suitability.
3. For school content: select existing school or request a new school; select class, board, book/edition, subject, chapter, and optional question(s).
4. Select Free or Paid; for paid, configure price/entitlement subject to platform rules.
5. Add thumbnail/captions/tags and declare ownership/permission.
6. Upload to the configured Google Drive workflow or approved storage path.
7. Run moderation; only approved + active + safe content is public.
8. Publish and index in search/category pages.

One video may be mapped to multiple questions/chapters through link records, not duplicated video uploads.

### Learning discovery
- Search by school, class, board, book, subject, chapter, exact question text/number, teacher, language, Free/Paid, and difficulty.
- Chapter page lists question groups and videos from multiple teachers.
- Question page shows all relevant explanations with teacher name, language, duration, price, rating/reports where meaningful.
- Filters: Free, Paid, language, verified teacher, newest, popular, difficulty.

### Study tools
- Notes/PDFs where upload rights are confirmed.
- Homework and assignment submission (text/image/PDF) with teacher feedback.
- Practice questions, quizzes, chapter tests, mock tests, results and explanations.
- Bookmarks, continue watching, study planner, progress tracking.
- Doubt/Q&A with reporting and moderation.
- Live classes and attendance can be a later phase; do not promise live functionality until conferencing, consent, recording, and moderation are implemented.
- Parent/guardian view for child accounts, with age-appropriate privacy and controls.

## 7. Other category experiences
Each category gets relevant filters rather than forcing school metadata:
- Agriculture: crop, season, region, soil/water topic, equipment, language, expert.
- Animal husbandry: animal type, breed, dairy/poultry/goat care, training topic.
- Skills: skill, level, tools, course, instructor, certification (only if genuinely issued).
- Competitive exams: exam, subject, syllabus, year, topic, mock test.
- Technology: skill/language/tool/version, beginner/intermediate/advanced.
- Health education: general topic, source/reviewer credentials; emergency guidance directs users to local emergency services. No diagnosis claims.
- Languages: target language, proficiency, speaking/reading/writing.
- Sports/fitness: sport/activity, skill level, safety guidance.
- Business/career: topic, level, course, instructor; avoid guaranteed income/job claims.

## 8. Free and Paid model
- Creator chooses Free or Paid where authorized.
- Paid content requires server-side entitlement validation on every protected playback/download path.
- Payment pending, failed, refunded, disputed, or unknown states must not grant access.
- No public direct Drive URLs for protected videos.
- Pricing, commissions, refunds, settlement, and creator earnings must be governed by an explicit admin-approved policy and tested before payouts.
- Free content may be eligible for approved ads; paid playback should be ad-free by default.

## 9. Monetag and advertising
- Monetag is an optional ad provider, not a guaranteed revenue source.
- Admin-controlled ad placements: home feed slot, category page slot, and eligible free-feed intervals.
- Do not inject ads inside a paid lesson or obstruct core playback controls.
- Frequency caps, user experience controls, consent/privacy requirements, age restrictions, and provider policy checks are mandatory.
- Do not show ads in child-directed/underage experiences unless the applicable laws, consent rules, and ad-provider policies explicitly allow it; safest default is no personalized ads for child accounts.
- Ad loading must not block video playback. Provide graceful fallback if ad script fails.
- Keep provider IDs/scripts in environment/configuration, never hard-code secrets. Validate ads.txt and provider setup before production.

## 10. Admin, moderation, and trust
- Role-based admin, moderator, school admin, teacher/creator, learner, and guardian access.
- Review queues for videos, school claims, teacher verification, comments, reports, and questions.
- Statuses: pending, approved, rejected, suspended; active flag separate from moderation state.
- Audit logs for role changes, approvals, school merges, price changes, refunds, and payouts.
- User reporting, blocking, comment moderation, copyright takedown workflow, appeals.

## 11. Search
Global search supports videos, categories, schools, teachers, books, chapters, questions, courses, and tags. Use normalized searchable fields, aliases/transliterations, Hindi/English terms, typo tolerance where feasible, and filters. Search results must respect moderation, visibility, age, and paid entitlement.

## 12. Monetization and creator analytics
- Creator dashboard: views, watch time, followers, free/paid content, sales, refunds, eligible ad revenue (if provider reporting permits), and payout status.
- Admin dashboard: content health, moderation queue, category performance, ad placement health, payment reconciliation, refunds, creator settlement reports.
- Do not show estimated ad revenue as guaranteed income. Clearly label estimates and provider-reported values.

## 13. Accessibility, localization, and performance
- Hindi and English first; architecture supports additional Indian languages.
- Captions/subtitles, readable contrast, scalable text, screen-reader labels, keyboard/D-pad navigation.
- Low-bandwidth mode, thumbnail optimization, adaptive video, lazy loading, retry and offline saved metadata (offline video only where rights allow).

## 14. Release roadmap
### Phase 0 — Audit and safety baseline
Inventory current source, routes, Firebase collections/rules, Drive upload/stream paths, payment checks, ad integration, mobile/TV UI. Make a verified backup and tests. Do not alter production data.
### Phase 1 — Core JEMBEE PLAY
Branding, Home, Shorts feed, search, profile, categories, Drive Service Account read path, Firebase feed mapping, moderation and paid access regression tests.
### Phase 2 — Category and creator foundation
Admin-managed categories/subcategories, category feeds, creator profiles, upload metadata, global search, moderation dashboard.
### Phase 3 — Smart Learning
School directory, class/board/book/subject/chapter/question catalogue, teacher-school association, question-wise video discovery, notes and quizzes.
### Phase 4 — Monetization and community
Free/Paid purchase flow, creator analytics, comments/Q&A, saved lessons, carefully placed Monetag ads, refunds and settlement tests.
### Phase 5 — Advanced learning and devices
Homework, assignments, mock tests, parent dashboard, live classes, AI study assistant (with safety controls), Android TV polish and performance.

## 15. Definition of done
- Existing Firebase project and historical video records remain intact.
- Existing Google Drive videos are read without re-upload.
- Only approved, active, safe content appears publicly.
- Paid playback remains protected server-side and fails closed.
- Category menu supports swipe, accessible navigation, and optional auto-scroll.
- Search finds category/school/book/chapter/question/teacher/video.
- Duplicate school/catalogue submissions are reviewed and not blindly duplicated.
- Free/Paid labels and entitlements are accurate.
- Ads are limited to approved placements and do not interrupt paid playback.
- Mobile and Android TV navigation are tested separately.
- Build, lint, typecheck, security rules, and critical API tests pass before release.
