# ISTIDLAL

ISTIDLAL in this repository is the **static GitHub Pages demo** version of the product.

The original full local version remains separate. This copy is intentionally optimized for public deployment and does **not** require:

- a backend
- Prisma or SQLite at runtime
- YouTube API access
- secret keys
- any `.env` file at build time or runtime

## Demo Scope

This deployment preserves the core product identity:

- browse-first educational discovery
- topic-first organization
- curated topic collections
- deterministic-looking learning paths
- continuation and "what to learn next"
- trusted-source cues
- a product experience that is not a raw YouTube wall

This GitHub Pages demo is powered by a dedicated local demo content layer in [`lib/demo-content.ts`](./lib/demo-content.ts). All visible content comes from deterministic in-repo data.

## What Changed For This Version

- all displayed content now comes from local curated demo data
- all `app/api/*` routes were removed from the deployed app
- the app uses Next.js static export
- dynamic routes are pre-generated at build time
- search works client-side against local demo data
- categories, collections, learning paths, trending, library, and video pages all run without a server
- GitHub Pages base-path and asset-prefix handling are configured in [`next.config.mjs`](./next.config.mjs)

## Demo Content Layer

The demo content layer lives in [`lib/demo-content.ts`](./lib/demo-content.ts) and provides:

- homepage data
- category cards
- curated topic collections
- static learning-path source data
- Explore Now / worth exploring sections
- static search response shaping
- trusted source summaries
- video detail records with next-step relationships

Each demo video record includes:

- title
- thumbnail
- source cue
- topic
- category
- summary
- duration
- progression label
- next-step recommendations

The app still reuses the existing shaping logic for:

- topic collections
- learning paths
- category browsing
- trusted source summaries
- search ranking
- continuation recommendations

## Local Development

No environment variables are required.

```bash
npm install
npm run dev
