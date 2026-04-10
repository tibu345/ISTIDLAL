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

Each demo video record includes believable product fields such as:

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

That keeps the product feeling intentional rather than mocked with flat placeholder arrays.

## Local Development

No environment variables are required.

Install dependencies:

```bash
npm install
```

If PowerShell blocks `npm`, use:

```bash
npm.cmd install
```

Run locally:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Static Build / Export

Build the static export:

```bash
npm run build
```

With `output: "export"` enabled, Next.js writes the deployable static site to:

```text
out/
```

This build succeeds in a clean environment with no secrets configured.

## GitHub Pages Deployment

Deployment workflow file:

- [`deploy-pages.yml`](./.github/workflows/deploy-pages.yml)

The workflow:

1. runs on pushes to the `github-pages` branch
2. installs dependencies with `npm ci`
3. runs `npm run build`
4. uploads the `out/` directory as the Pages artifact
5. deploys that artifact to GitHub Pages

### Exact Deployment Steps

1. Push this repository copy to GitHub.
2. In GitHub, enable **Pages** and set the source to **GitHub Actions**.
3. Use or create the `github-pages` branch for deployment.
4. Push commits to `github-pages`.
5. GitHub Actions will build and publish the static export automatically.

The Next config uses the repository name from `GITHUB_REPOSITORY` during Actions builds so links and assets resolve correctly from a project subpath.

## Unsupported Features In This Demo

These features are intentionally omitted from the GitHub Pages version:

- live YouTube ingestion
- runtime refresh
- diagnostics endpoints
- Prisma migrations and database persistence
- SQLite runtime storage
- thumbnail proxying
- backend API routes
- secret-based admin actions

The browser-only personalization surfaces still work using local `localStorage` for:

- saved videos
- recently viewed videos
- consent state

## Important Files

- [`lib/demo-content.ts`](./lib/demo-content.ts): explicit static demo content source
- [`next.config.mjs`](./next.config.mjs): static export and GitHub Pages configuration
- [`app/page.tsx`](./app/page.tsx): homepage wired to demo content
- [`app/search/page.tsx`](./app/search/page.tsx): static search entry page
- [`components/SearchExperience.tsx`](./components/SearchExperience.tsx): client-side search for exported builds
- [`app/videos/[slug]/page.tsx`](./app/videos/[slug]/page.tsx): static video detail generation
- [`app/collections/[slug]/page.tsx`](./app/collections/[slug]/page.tsx): static topic collection generation
- [`app/sources/[key]/page.tsx`](./app/sources/[key]/page.tsx): static trusted-source generation

## Notes

- `npm run dev` is the local editing workflow.
- `npm run build` produces the deployable static export.
- `npm run start` is intentionally a guidance message, because this repository copy is not meant to run as a Node server deployment.
=======
# ISTIDLAL
