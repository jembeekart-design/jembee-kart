# Next.js 16.2.9 Local Guidance Review

The user supplied `next-local-docs-16.2.9.zip`. The relevant bundled guides were read before Next/React source changes:

- `node_modules/next/dist/docs/01-app/03-api-reference/05-config/03-eslint.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/05-config/02-typescript.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-search-params.md`

Applied constraints:

1. Keep the flat ESLint configuration using `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
2. Use the ESLint CLI; Next.js 16 removed `next lint`.
3. Treat React Hooks purity and effect rules as code correctness checks; do not disable rules globally.
4. `useSearchParams` is client-only and can trigger a prerender bailout; keep the component under a `Suspense` boundary. The `/shorts` route wraps `FullscreenVideoFeed` in `Suspense`.
5. Next.js TypeScript checking remains part of the user's final `next build`; a syntax parse alone is not a substitute for semantic typechecking.

This file records which version-specific guidance was consulted; the complete documentation bundle is not copied into the source ZIP.
