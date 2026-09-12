# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Petya Speaks — a personal literary site (Bulgarian-language: poetry, essays, stories) for an author. Built with Astro, content-managed through an embedded Sanity Studio. Content (author bio, books, blog posts, press mentions) lives in Sanity and is fetched at build time to produce a fully static site.

## Development

Start the dev server in background mode:

```
astro dev --background
```

Manage it with `astro dev stop`, `astro dev status`, and `astro dev logs`. The same server serves both the Astro site and the embedded Sanity Studio at `/studio` — there is no separate Studio process to run.

Other commands:

- `npm run build` — production build to `./dist/` (deployed as a static site via Vercel; see `vercel.json`).
- `npm run preview` — preview the production build locally.
- `npm run astro -- check` — type-check the project (via `astro/tsconfigs/strict`).
- There is no test suite or linter configured in this repo.
- Sanity CLI commands (`npx sanity deploy`, dataset import/export, etc.) read project identity from `sanity.cli.ts`.

## Architecture

- **One repo, two apps, one shared identity.** This is simultaneously an Astro site and a Sanity Studio, wired together only through `sanity/env.ts`, which exports `projectId`/`dataset`/`apiVersion`. `astro.config.mjs` (via the `@sanity/astro` integration) and `sanity.config.ts`/`sanity.cli.ts` all import from that one file — it's the single place project identity lives.
- **Content model** (`schemaTypes/`): four document types — `author` (a singleton, pinned to the top of the Studio's document list in `sanity.config.ts`'s custom structure), `book`, `post` (has a `category`: poem/essay/story), and `press`. Field titles/labels are in Bulgarian since they're editor-facing in the Studio UI.
- **Data access is centralized** in `src/lib/sanity.ts`: every GROQ query and projection (`getAuthor`, `getBooks`, `getBookBySlug`, `getPosts`, `getPostBySlug`, `getPress`), the shared TS types (`Author`, `Book`, `Post`, `PressItem`), the `urlFor` image-URL builder, the `categoryLabels`/`categoryColors` maps, and small helpers (`formatDate`, `readingTime`). Astro pages call these directly in their frontmatter — there's no API route layer.
- **Data is fetched at build time, deliberately uncached**: `useCdn: false` in `astro.config.mjs` — since every query runs once per build rather than per visitor, the CDN's caching would only add staleness risk right after a publish-triggered rebuild, not a performance benefit. Dynamic routes (`src/pages/blog/[slug].astro`, `src/pages/books/[slug].astro`) use `getStaticPaths()` to pre-render one page per Sanity document.
- **Rich text**: Portable Text is rendered by hand via `@portabletext/to-html` in `src/components/PortableText.astro`, with custom block/mark/list/type renderers that emit Tailwind-classed HTML directly (not the `astro-portabletext` component library).
- **Styling**: Tailwind v4 via the `@tailwindcss/vite` plugin — there is no `tailwind.config.js`; theme tokens (colors, fonts) are defined inline in `src/styles/global.css` under `@theme`. Because of this, `categoryColors` in `src/lib/sanity.ts` spells out full literal Tailwind class strings per category rather than composing them from a color name, so Tailwind's static content scanner can find and generate them.
- **Scroll/motion behavior lives in one place**: `src/layouts/Layout.astro`'s inline script drives `.reveal` intersection-observer fade-ins, the nav's shadow-on-scroll, and view-scoped video autoplay (`data-autoplay-on-view`). All three re-run on the `astro:page-load` event because the site uses Astro View Transitions (`<ClientRouter />`), and all respect `prefers-reduced-motion`.
- **Images**: `src/components/SanityImage.astro` wraps `urlFor()` for CMS-hosted images; static assets (hero/background videos and their posters) live in `public/media/` and are referenced by path directly.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
