# Cloudflare Migration Readiness and Architecture

Date: 2026-11-22
Repository: jembeekart-design/jembee-kart
Base inspected: main

## Decision

A Cloudflare migration is feasible, but do not deploy the current project using the generic Workers setup form or a bare `npx wrangler deploy` command. Keep Vercel Production and the current domain unchanged until a separate Cloudflare staging environment passes full QA.

For this application, the first architecture to prototype should be **Cloudflare Containers running the existing Next.js Node.js server**, fronted by a Cloudflare Worker/Container routing layer. This preserves the existing Node.js server environment for Firebase Admin and Google Drive dependencies better than trying to port the entire application to the Workers isolate runtime.

## Confirmed repository facts

- Next.js 16.2.9, React 19.2.7, App Router, and server API routes.
- No Wrangler or OpenNext configuration exists on main.
- `src/firebase/admin.ts` initializes the official `firebase-admin` SDK and exports Firestore, Auth, and Storage clients.
- Many server routes import `firebase-admin/firestore`, `getAdminDb`, and `getAdminAuth`.
- Google Drive integration uses `googleapis`, OAuth2, Node streams, resumable upload sessions, and range-based media streaming.
- Existing `package.json` has `next build --webpack` and `next start`; no standalone output has yet been configured.

## Why not deploy straight to a Workers isolate?

Cloudflare recommends vinext for new Next.js Workers migrations, but documents it as beta and asks teams to run `npx vinext check` and review compatibility before production use. OpenNext supports Next.js 16 and most App Router features, but it still runs on the Workers runtime's Node.js compatibility subset, not a complete conventional Node.js server.

The Firebase Admin Firestore client and Google APIs are critical server dependencies. Cloudflare's Node.js compatibility documentation explicitly distinguishes fully supported APIs from polyfills/stubs; the presence of a Node module import does not guarantee its methods work. In particular, Node HTTP/2 is listed as a stub module, which is a risk for gRPC-based clients. Do not assume that setting `nodejs_compat` makes every Node package compatible.

## Preferred prototype: Cloudflare Containers

Cloudflare Containers are generally available and run Linux container images with a normal Node.js process. A containerized Next.js server can preserve the current Firebase Admin and Google Drive code with fewer changes.

Prototype requirements:
1. Configure Next.js standalone output and create a production Dockerfile.
2. Create a separate Cloudflare Worker that forwards application requests to a Container; use the documented Container/Durable Object binding pattern.
3. Build and deploy only a separate staging Worker, not the production Worker.
4. Configure secrets as Cloudflare secrets/runtime environment values; never commit service-account JSON, private keys, OAuth secrets, Cashfree secrets, or signing keys.
5. Verify container startup, health checks, logs, video range responses, resumable uploads, and all server APIs.
6. Use a separate staging domain; do not alter DNS or the Vercel domain during testing.

### Plan and cost gate

Cloudflare's published Containers pricing says Containers are not included on Free; the Workers Paid plan is $5/month and includes limited monthly Container usage, with additional usage billed by provisioned memory, active CPU, disk, and network egress. Confirm the account's billing plan and spending limits before enabling Containers. This is a separate decision from the Vercel plan.

## Alternative: Workers runtime / OpenNext

If Containers are unavailable or not desired, evaluate OpenNext/vinext only after a dependency-by-dependency compatibility test. A proper port would require replacing or isolating Firebase Admin operations and Google Drive Node SDK/streaming paths, with parity tests for transactions, batched writes, authentication revocation, storage signed URLs, OAuth, and byte-range video playback. This is not a simple configuration-only change.

## Staging acceptance checklist

- Login, ID token verification, token revocation and admin role checks.
- Firestore query, transaction, batch, pagination, and financial ledger writes.
- Creator upload, Google Drive resumable upload, moderation, delete, and playback.
- Byte-range video streaming and mobile network interruption/resume.
- Live streams, Shorts, Long Videos, comments, likes, shares, saves.
- Cashfree checkout, webhook signature verification, refunds and settlements.
- Monetag/ExoClick placements and admin controls.
- APK release metadata and verified GitHub Release download redirects.
- Mobile and Android TV end-to-end QA.
- Logs, error reporting, spending limit, rollback, and independent staging secrets.

## Current status

- This PR is an audit/architecture correction only; it does not change runtime code.
- No Cloudflare app has been deployed.
- No Vercel production setting, domain, or deployment has been changed.
- No credentials have been copied or modified.
- Keep the Cloudflare Dashboard setup flow open; do not deploy the generic Worker form yet.

## References

- Cloudflare Next.js guide and vinext beta status: https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/
- Cloudflare OpenNext adapter and supported Next.js versions: https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/
- Cloudflare Node.js compatibility and non-functional stubs: https://developers.cloudflare.com/workers/runtime-apis/nodejs/
- Cloudflare Containers getting started: https://developers.cloudflare.com/containers/get-started/
- Cloudflare Containers deployment: https://developers.cloudflare.com/containers/guides/deploy/
- Cloudflare Containers pricing: https://developers.cloudflare.com/containers/platform/pricing/
- Firebase Admin SDK setup: https://firebase.google.com/docs/admin/setup
- Google Drive resumable uploads: https://developers.google.com/workspace/drive/api/guides/manage-uploads
