# Discovery module

Owns discovery catalog query normalization and category filtering. UI routes remain adapters and retain their existing presentation. The category catalog is still a curated static seed; this module does not claim live Firestore search, ranking, recommendations, or feed personalization.

Next migration steps: introduce a server-only catalog repository after the Firestore schema and approved-content rules are mapped; then add pagination, moderation filtering, and ranking behind existing route contracts.
