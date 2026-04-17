# SmartShopper

Australian supermarket price intelligence. Track Coles, Woolworths, ALDI and IGA prices
over time, spot genuine specials vs cosmetic markdowns, optimise a shopping list across
multiple retailers, and get a data-backed recommendation on whether delivery or
click-and-collect will save you more.

## Monorepo layout

```
apps/
  web/          Next.js 15 user web app
  mobile/       Expo (React Native) app
  api/          NestJS REST/GraphQL API, BullMQ workers
  admin/        Next.js admin dashboard
services/
  scrapers/     Per-retailer catalogue + specials scrapers
packages/
  db/           Prisma schema + migrations (Postgres + TimescaleDB)
  core/         Pure TS: pricing stats, basket optimiser, delivery recommender
  types/        Shared zod schemas and TS types
  ui/           Shared design tokens and React components
  config/       Shared eslint, tsconfig and prettier presets
infra/
  docker/       Local dev stack: postgres+timescale, redis, minio, mailhog
```

## Quick start

```bash
# Requirements: Node >= 20.11, pnpm 9, Docker (for local Postgres + Redis)
pnpm install

# Bring up local infrastructure
docker compose -f infra/docker/docker-compose.yml up -d

# Generate prisma client and apply migrations
pnpm --filter @smartshopper/db generate
pnpm --filter @smartshopper/db migrate:dev

# Run everything in dev mode
pnpm dev
```

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Runs every app/package in watch mode via Turbo |
| `pnpm build` | Production build of everything |
| `pnpm test` | Unit tests across workspaces |
| `pnpm typecheck` | `tsc --noEmit` in every workspace |
| `pnpm lint` | ESLint across all workspaces |
| `pnpm format` | Prettier write |

## Implementation status

| Milestone | Status |
| --- | --- |
| M0 Scaffold | in progress |
| M1 Scraper pipeline | pending |
| M2 Product matching | pending |
| M3 Web MVP | pending |
| M4 Price pattern analyser | in progress (core package) |
| M5 Basket optimiser | in progress (core package) |
| M6 Delivery recommender | in progress (core package) |
| M7 Mobile app | pending |
| M8 Receipt OCR + crowdsourcing | pending |
| M9 Alerts + polish | pending |

## Legal & compliance

Scrapers respect `robots.txt`, rate-limit to 1 request per 2 seconds per host,
identify themselves with a contact email in their User-Agent, and do not bypass
logins or CAPTCHAs. Retailer terms of service are reviewed per domain before a
new scraper is enabled.
