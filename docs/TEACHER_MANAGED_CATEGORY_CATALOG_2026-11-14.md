# Teacher-managed Explore and School catalog

- Authenticated teachers/uploaders can create custom Explore categories and topics from the video upload page.
- Authenticated teachers/uploaders can add Board, School, Class, Subject, Book, Chapter and Question entries.
- New entries are published to the public catalog immediately and tagged with their creator UID.
- A creator can update/delete only their own entries through the API; parent entries cannot be deleted while children exist.
- Admin Category page is read-only. Video moderation remains separate and is not bypassed by catalog creation.
- Public catalog GET returns published entries and omits creator UID metadata.
- Category route documents are typed as `Record<string, unknown>` to avoid the prior TypeScript `status` inference error.
