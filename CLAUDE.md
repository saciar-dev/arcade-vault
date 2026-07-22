# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Arcade Vault — a platform for playing games online and competing for the highest score (per README, in Spanish). Currently a freshly scaffolded Next.js app with no game features implemented yet.

## Critical: Next.js 16 is not the Next.js in your training data

This project pins `next@16.2.11` and `react@19.2.4` — versions newer than your training data, with real breaking changes from the Next.js you know. **Before writing any App Router code, read the relevant doc in `node_modules/next/dist/docs/01-app/`** rather than relying on memorized APIs. Key differences to internalize:

- **Turbopack is the default** for both `next dev` and `next build` (no `--turbopack` flag needed). A custom Webpack config will make `next build` fail unless you pass `--webpack`.
- **All Request APIs are fully async, no sync fallback**: `cookies()`, `headers()`, `draftMode()`, `params`, and `searchParams` must always be awaited — the old synchronous access that Next 15 still tolerated is gone. Use the generated `PageProps<'/route'>` / `LayoutProps` / `RouteContext` helpers (via `npx next typegen`) for type-safe access.
- **`middleware.ts` is deprecated in favor of `proxy.ts`** — export `proxy()` instead of `middleware()`. The `edge` runtime is not supported in `proxy`.
- **`revalidateTag` now requires a second `cacheLife` profile argument** (`revalidateTag('posts', 'max')`). For read-your-writes semantics use the new `updateTag()` instead.
- **Cache Components** (`cacheComponents: true` in `next.config.ts`) replaces the old experimental `ppr`, `dynamicIO`, and `useCache` flags.
- **`next lint` is removed** — this repo lints via `eslint` directly (see below), not `next build`.
- Parallel route slots require an explicit `default.js`/`default.tsx`, or the build fails.
- `next/image`: local images with query strings need `images.localPatterns[].search` configured; `images.domains` is deprecated in favor of `images.remotePatterns`.

When in doubt about an API's current shape, grep `node_modules/next/dist/docs/` before guessing.

## Commands

```bash
npm run dev      # start dev server (Turbopack, by default)
npm run build    # production build (Turbopack, by default)
npm run start    # run the production build
npm run lint     # eslint (flat config — see eslint.config.mjs)
```

There is no test runner configured yet.

## Architecture

- App Router only, under `app/`. Currently just the default `create-next-app` scaffold: `app/layout.tsx` (root layout, Geist fonts), `app/page.tsx` (placeholder home page), `app/globals.css`.
- Styling is Tailwind CSS v4 via `@tailwindcss/postcss` (no `tailwind.config` file — v4 is CSS-first, configure in `globals.css`).
- Path alias `@/*` maps to the project root (see `tsconfig.json`).
- TypeScript strict mode is on.

## Spec-driven workflow

This project follows spec-driven development using the `/spec` and `/spec-impl` skills from https://github.com/Klerith/fernando-skills (installed via `npx skills@latest add Klerith/fernando-skills`). Prefer writing/updating a spec before implementing new features when these commands are available.
