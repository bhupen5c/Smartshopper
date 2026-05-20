/**
 * CLI entry point.
 *
 *   pnpm --filter @smartshopper/scraper scrape           # all retailers
 *   pnpm --filter @smartshopper/scraper scrape coles     # one retailer
 *   pnpm --filter @smartshopper/scraper scrape list      # list active retailers
 *   pnpm --filter @smartshopper/scraper scrape --dry     # run, but don't write to Supabase
 *
 * Needs SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in the env (config is
 * read from Supabase even in --dry mode — only writes are skipped).
 * GEMINI_API_KEY is required for the PDF / HTML strategies.
 */

import { runAll, runRetailer, listActiveRetailers, type ScraperDeps } from './index.js';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const target = args.find((a) => !a.startsWith('--'));

const deps: ScraperDeps = {
  supabaseUrl: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  dryRun: dry,
};

async function main() {
  if (target === 'list') {
    console.log((await listActiveRetailers(deps)).join('\n'));
    return;
  }
  if (target) {
    const result = await runRetailer(target, deps);
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  const results = await runAll(deps);
  console.log(
    results
      .map((r) => `${r.retailerCode.padEnd(15)} ${r.itemsEmitted.toString().padStart(4)} items  ${r.ok ? '✓' : '✗'}  ${r.notes ?? ''}`)
      .join('\n'),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
