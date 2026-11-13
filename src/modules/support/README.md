# Support & Teacher–Student Communication Contracts

This phase adds pure validation and workflow contracts only. It does **not** add a production ticket API, conversation persistence, realtime messaging, staff console, email/WhatsApp delivery, or Firestore rules for new collections.

Security requirements for the next integration phase:
- Derive requester identity from a Firebase ID token verified server-side (including revocation where appropriate); never accept requester UID from JSON.
- Authorize conversation reads/writes using server-loaded participant records; never trust client-provided participant arrays.
- Restrict ticket status transitions to staff except the narrowly allowed requester reopen transition.
- Store audit events server-side and make them append-only to clients.
- Apply rate limits, request-body byte limits, attachment scanning, retention/deletion policy, and abuse reporting before public release.
- Keep teacher verification distinct from creator status; only verified, active teachers may receive new contact requests.
