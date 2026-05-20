# Current focus

_Update this as work moves._

## Now

Live price pipeline — Supabase + Gemini catalogue-PDF scraper. Built and
merged across PRs #10–#13.

## Blockers (all on the maintainer, not code)

1. **`SUPABASE_URL` not set in Vercel env** → `/api/prices` returns
   "Supabase not configured". #1 blocker — 30-second paste + redeploy.
   Value: `https://bkxfnginzptwthypriub.supabase.co`
2. **`GEMINI_API_KEY` not set** → `gemini_pdf` strategies skip.
3. **`retailers.catalogue_url` is NULL** for all 13 supermarkets → each
   needs a real weekly catalogue-PDF URL before it will scrape.

## Status

App is fully functional on the seeded in-repo `PRICE_MATRIX` fallback —
every page works, the shopping flow runs. Live pricing is the only thing
waiting, entirely on the 3 items above.

## Shipped

- Real OSM store data + 20+ AU retailers
- Brutalist "Receipt-shop" design system (Claude Design handoff)
- Walkable-distance ranking fix, all-retailer price strips, basket/travel split
- Supabase schema + seed, scraper package, cron routes + Vercel cron
- Cron auth hardening (`CRON_SECRET` required)
