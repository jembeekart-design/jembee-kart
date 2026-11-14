# Explore Categories, School Catalog and Video Upload

## What changed
- Explore category records now start from the built-in category catalog and merge published Admin-managed categories from `/api/content-categories`.
- Admin dashboard and sidebar link to `/admin/categories`.
- The Category Management screen can update built-in category descriptions/topics and publish additional categories.
- School learning uses a dedicated parent-linked catalog: Board → School → Class → Subject or Book → Chapter → Question.
- Public Explore, School Learning and Video Upload read only published catalog entries.
- Video Upload requires a category. Selecting School reveals the dedicated school hierarchy selectors.
- Upload metadata is validated server-side, saved with the moderation submission, and copied to `watchEarnVideos` only after Admin approval.
- Approved, active and safe videos assigned to a question are returned by `/api/learning/school-video-answers` and shown together on the School Learning question page.

## Firestore collections
- `contentCategories/{categoryId}`: `id`, `name`, `description`, `topics`, `iconKey`, `schoolSpecial`, `status`, audit timestamps and admin UID.
- `schoolLearningNodes/{nodeId}`: `id`, `type`, `name`, `parentId`, `status`, audit timestamps and admin UID.
- Existing `videoModerationSubmissions/{submissionId}` records receive category and school path metadata during upload.
- Existing `watchEarnVideos/{videoId}` records receive that metadata after moderation approval.

## Security and publication behavior
- All category and school catalog writes use server-side `verifyMonetagAdmin` authorization.
- Public catalog reads expose only records whose status is `published`.
- Parent entries must exist and be published before a child can be added.
- A school catalog node with children cannot be deleted until its children are removed or moved.
- School uploads require a published Board, School, Class and either Subject or Book. Optional Chapter and Question selections must match the selected parent chain.
- Question answer lookup returns only approved, active, moderation-safe videos. It does not expose Drive upload IDs.
- No live payout, revenue calculation or payment behavior was changed.

## Validation performed
- `npm run test:category-catalog`: 8 passed, 0 failed.
- Existing paid-video moderation approval contract: 2 passed, 0 failed.
- TypeScript/TSX syntax transpilation: 13 changed source files passed.
- Full `npm ci`, TypeScript typecheck and Next.js production build could not be run in this environment because `npm ci --no-audit --no-fund` timed out while fetching dependencies. Run these in Termux before committing/deploying.

## Admin setup after deployment
1. Open `/admin/categories` as an Admin.
2. Edit the built-in School category if needed, or add other categories/topics.
3. Add a Board (e.g. CBSE, ICSE, JAC).
4. Add Schools under the Board.
5. Add Classes under each School.
6. Add Subjects and/or Books under each Class.
7. Add Chapters under a Subject or Book, then Question numbers under a Chapter.
8. Creators can select the matching path in `/videos/upload`.
