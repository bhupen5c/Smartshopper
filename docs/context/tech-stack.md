# Tech stack

| Layer | Choice |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| `apps/web` | Next.js 14.2 (App Router) · React 18.3 · TypeScript 5.7 |
| Styling | Tailwind 3.4 · brutalist "Receipt-shop" system (Boldonse / Bricolage Grotesque / JetBrains Mono) |
| `packages/core` | basket optimiser, pricing analysis, delivery quoting · tsup + vitest |
| `packages/types` | shared Zod schemas / wire types |
| `packages/scraper` | Gemini catalogue-PDF price scraper |
| `packages/config` | shared tsconfig |
| Auth | NextAuth 4 (credentials provider, JWT) |
| Database | Supabase / Postgres — project `bkxfnginzptwthypriub`, `ap-southeast-2` |
| Stores / maps | OpenStreetMap via Overpass API · Leaflet + react-leaflet |
| Scraping | Gemini 2.5 Flash (Vision, catalogue PDFs) |
| Queue | Upstash QStash (cron fan-out) |
| Hosting | Vercel · cron `0 14 * * *` (midnight AEST) |

## Supabase tables

- `retailers` — code, kind, `scraping_strategy`, `catalogue_url`, `derived_markup`
- `products` — global product master
- `prices` — time-series; every scrape INSERTs new rows tagged `scraped_at`
- `scrape_runs` — per-retailer audit log
- `latest_prices` view — newest row per `(retailer_code, product_id)`; RLS `security_invoker`

## Key API routes (`apps/web/src/app/api`)

- `stores` — Overpass proxy, multi-mirror, CDN-cached
- `prices` — reads `latest_prices`; `buildOffers` falls back to in-repo `PRICE_MATRIX`
- `cron/scrape-prices` — daily entry; `CRON_SECRET`-gated; QStash fan-out or serial
- `cron/scrape-retailer` — QStash worker, one retailer per call

## Env vars

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`GEMINI_API_KEY`, `GEMINI_MODEL`, `CRON_SECRET`, `QSTASH_TOKEN`,
`NEXTAUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`.
All Supabase access is server-side — no `NEXT_PUBLIC_` prefix (it
build-time-inlines and breaks redeploys).
