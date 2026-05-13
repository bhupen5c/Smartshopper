/**
 * CLI entry point.
 *
 *   pnpm --filter @smartshopper/scraper scrape           # all retailers
 *   pnpm --filter @smartshopper/scraper scrape coles     # one retailer
 *   pnpm --filter @smartshopper/scraper scrape --dry     # don't write to Supabase
 *
 * Reads env from process.env, expects NEXT_PUBLIC_SUPABASE_URL +
 * SUPABASE_SERVICE_ROLE_KEY + GEMINI_API_KEY (the latter optional).
 */

import { runAll, runRetailer, listRetailers } from './index.js';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const target = args.find((a) => !a.startsWith('--'));

const deps = {
  // Skip Supabase writes when --dry. Strategies still run + log results.
  supabaseUrl: dry ? undefined : process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
  supabaseServiceKey: dry ? undefined : process.env.SUPABASE_SERVICE_ROLE_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
};

async function main() {
  if (target === 'list') {
    console.log(listRetailers().join('\n'));
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
