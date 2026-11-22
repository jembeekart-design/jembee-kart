# Cloudflare Workers Readiness Audit

Date: 2026-11-22
Repository: jembeekart-design/jembee-kart
Base: main

## Decision

Do not deploy this application to Cloudflare yet. A Cloudflare deployment configuration alone would create a misleading green build while important server routes could fail at runtime.

The first safe migration target should be a separate Cloudflare Preview using the Cloudflare OpenNext adapter for Next.js 16. Keep the current Vercel production deployment and domain unchanged until parity testing is complete.

## Confirmed repository facts

- Next.js is pinned to 16.2.9; React is 19.2.7.
- The project uses the App Router and server API routes.
- No `wrangler.toml`, `wrangler.jsonc`, or `open-next.config.ts` exists on main.
- `src/firebase/admin.ts` initializes the official `firebase-admin` SDK and exports Admin Firestore, Auth, and Storage clients.
- Multiple API routes and server modules import `firebase-admin/firestore` and the shared Admin clients.
- Google Drive integration imports `googleapis`, uses OAuth2, Node streams, and streaming file upload/download paths.
- The existing application uses Firebase and Google Drive server-side functionality; these are production-critical integration paths, not optional static-page features.

## Cloudflare adapter choice

Cloudflare's current Next.js guide recommends vinext for new migrations, but explicitly describes vinext as beta and asks teams to run `npx vinext check` and review compatibility before production adoption.

For this existing, feature-rich Next.js 16 application, evaluate the Cloudflare OpenNext adapter first in an isolated Preview. OpenNext documents support for all minor/patch releases of Next.js 16 and supports App Router, Route Handlers, SSR, RSC, middleware, and streaming. This is a compatibility-first choice, not a guarantee that every application dependency works in Workers.

## Blocking runtime compatibility risks

### 1. Firebase Admin SDK

The official `firebase-admin` Node SDK is intended for server-side Node.js environments. The Firestore Admin implementation depends on gRPC; Cloudflare Workers does not provide the Node gRPC runtime required by the official SDK. Enabling `nodejs_compat` does not supply gRPC.

Before any real Cloudflare preview can be considered functionally ready, the server-side data/auth layer must be adapted and tested. Options to evaluate:
- keep privileged Firebase operations behind a separate Node.js service (for example, Cloud Run) and call it securely from the Worker; or
- replace the affected Admin SDK calls with a reviewed Workers-compatible REST implementation, with parity tests for transactions, batches, queries, auth verification, and storage operations.

Do not replace the Admin SDK wholesale with an unofficial compatibility package without a full API-surface and security review.

### 2. Google APIs and streaming

The Google Drive integration uses `googleapis`, OAuth2, Node streams, and media streaming. Cloudflare supports a subset of Node APIs, not an unrestricted Node server runtime. These routes need explicit compatibility tests and likely a fetch/Web Streams implementation or a separate Node service.

### 3. Secrets and runtime bindings

Cloudflare secrets/bindings must be configured separately. Never copy service-account private keys, OAuth client secrets, signing keys, or other credentials into source control or client-side variables. No production secrets should be added as part of this setup commit.

## Safe rollout plan

1. Preserve Vercel production and current domains.
2. Resolve the Firebase Admin and Google Drive runtime architecture before claiming compatibility.
3. Add the chosen adapter and Wrangler configuration on a dedicated branch only after those runtime decisions are made.
4. Run dependency/build checks and Cloudflare local preview.
5. Test authentication, Firestore reads/writes/transactions, admin authorization, video upload/playback, Google Drive resumable upload and range streaming, payments/webhooks, ads, and APK release endpoints.
6. Deploy a non-production Workers Preview and complete mobile/TV QA.
7. Only after all critical routes pass, plan a controlled domain cutover with rollback.

## Current status

- This branch contains an audit only.
- No Cloudflare application has been deployed.
- No Vercel production setting, domain, or deployment has been changed.
- No Firebase or Google credentials have been copied or modified.
- The Cloudflare Dashboard should remain on the repository-selection/setup flow; do not press Deploy yet.

## References

- Cloudflare Next.js / vinext guide: https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/
- Cloudflare OpenNext adapter: https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/
- OpenNext Cloudflare supported Next.js versions: https://opennext.js.org/cloudflare
- Firebase Admin SDK setup and supported server environment: https://firebase.google.com/docs/admin/setup
- Firebase Admin SDK's gRPC dependency and Workers limitation (community implementation notes): https://github.com/ljoukov/firebase-admin-cloudflare
