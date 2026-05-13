/**
 * @smartshopper/scraper — daily price scraping pipeline.
 *
 * Public API:
 *   - `getStrategy(retailerCode)` — returns the configured strategy for a retailer
 *   - `runRetailer(retailerCode, deps)` — scrapes one retailer end-to-end
 *   - `runAll(deps)` — convenience wrapper that runs every active retailer
 *   - `createGeminiClient`, `createSupabaseWriter` — DI helpers
 *
 * Strategies map 1:1 to the `scraping_strategy` column on the `retailers`
 * Supabase table:
 *   - 'direct_api'   → ./strategies/coles.ts (and woolworths.ts, TODO)
 *   - 'gemini_html'  → ./strategies/gemini-html.ts (configured per retailer)
 *   - 'gemini_pdf'   → TODO
 *   - 'derived'      → ./strategies/derive-convenience.ts
 *   - 'none'         → not scheduled
 */

import type { RetailerStrategy, ScrapeRunResult } from './types.js';
import { createGeminiClient } from './gemini.js';
import { createSupabaseWriter, type SupabaseWriter } from './supabase.js';
import { colesStrategy } from './strategies/coles.js';
import { deriveConvenienceStrategy } from './strategies/derive-convenience.js';
import { geminiHtmlStrategy } from './strategies/gemini-html.js';

export * from './types.js';
export { createGeminiClient } from './gemini.js';
export { createSupabaseWriter } from './supabase.js';

/** Static registry of strategies. Mirrors retailers table seed in migration 0002. */
const STRATEGIES: Record<string, () => RetailerStrategy> = {
  coles: () => colesStrategy(),
  // Woolworths — TODO: implement /apis/ui/v2/products endpoint
  // woolworths: () => woolworthsStrategy(),

  // Indies / IGA via Gemini HTML
  iga: () =>
    geminiHtmlStrategy({
      retailerCode: 'iga',
      catalogueUrl: 'https://www.iga.com.au/catalogue/',
      products: [
        { productId: 'p01', hint: 'Pauls Full Cream Milk 2L' },
        { productId: 'p05', hint: 'Tip Top White Bread 700g' },
        { productId: 'p09', hint: "Arnott's Tim Tam Original 200g" },
        { productId: 'p14', hint: 'Coca-Cola Classic 2L' },
        { productId: 'p38', hint: 'Eggs 12 pack cage free' },
      ],
    }),

  // Convenience / servo — derived from supermarket base.
  // Markups match the retailers table seed.
  seven_eleven: () => deriveConvenienceStrategy({ retailerCode: 'seven_eleven', markup: 1.50 }),
  nightowl:     () => deriveConvenienceStrategy({ retailerCode: 'nightowl',     markup: 1.45 }),
  lucky_7:      () => deriveConvenienceStrategy({ retailerCode: 'lucky_7',      markup: 1.40 }),
  bp:           () => deriveConvenienceStrategy({ retailerCode: 'bp',           markup: 1.60 }),
  ampol:        () => deriveConvenienceStrategy({ retailerCode: 'ampol',        markup: 1.55 }),
  shell:        () => deriveConvenienceStrategy({ retailerCode: 'shell',        markup: 1.55 }),
  mobil:        () => deriveConvenienceStrategy({ retailerCode: 'mobil',        markup: 1.55 }),
  united:       () => deriveConvenienceStrategy({ retailerCode: 'united',       markup: 1.50 }),
  otr:          () => deriveConvenienceStrategy({ retailerCode: 'otr',          markup: 1.40 }),
};

export function getStrategy(retailerCode: string): RetailerStrategy | null {
  const factory = STRATEGIES[retailerCode];
  return factory ? factory() : null;
}

export function listRetailers(): string[] {
  return Object.keys(STRATEGIES);
}

/** Dependencies for running scrapers. Defaults read from env. */
export interface ScraperDeps {
  geminiApiKey?: string;
  supabaseUrl?: string;
  supabaseServiceKey?: string;
  log?: (msg: string, extra?: Record<string, unknown>) => void;
}

interface ResolvedDeps {
  gemini: ReturnType<typeof createGeminiClient>;
  writer: SupabaseWriter | null;
  log: (msg: string, extra?: Record<string, unknown>) => void;
}

function resolve(deps: ScraperDeps): ResolvedDeps {
  return {
    gemini: createGeminiClient(deps.geminiApiKey ?? process.env.GEMINI_API_KEY),
    writer: createSupabaseWriter(
      deps.supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
      deps.supabaseServiceKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY,
    ),
    log: deps.log ?? ((msg) => console.log(`[scraper] ${msg}`)),
  };
}

/**
 * Scrape one retailer end-to-end:
 *   1. Run the strategy
 *   2. Persist `scrape_runs` + `prices` rows
 *   3. Return the result so callers can chain
 */
export async function runRetailer(
  retailerCode: string,
  deps: ScraperDeps,
): Promise<ScrapeRunResult> {
  const strategy = getStrategy(retailerCode);
  if (!strategy) throw new Error(`No scrape strategy for ${retailerCode}`);

  const { gemini, writer, log } = resolve(deps);
  log(`▶ scraping ${retailerCode}`);

  const result = await strategy.scrape({
    gemini,
    knownPrices: [], // single-retailer mode: derived strategies will skip
    log,
  });

  if (writer) {
    const runId = await writer.insertScrapeRun(result);
    if (runId) {
      const inserted = await writer.insertPrices(runId, result.prices);
      log(`  ✓ ${retailerCode}: ${inserted} prices written (run ${runId})`);
    } else {
      log(`  ✗ ${retailerCode}: failed to record scrape_run`);
    }
  }

  return result;
}

/**
 * Run every active retailer in sequence. Supermarkets first so their
 * prices populate `knownPrices` for the derived convenience strategies.
 */
export async function runAll(deps: ScraperDeps): Promise<ScrapeRunResult[]> {
  const { gemini, writer, log } = resolve(deps);
  const results: ScrapeRunResult[] = [];
  const knownPrices: ScrapeRunResult['prices'] = [];

  // Two-pass: supermarkets/indies first, then derived convenience.
  const order = [
    'coles', 'woolworths', 'aldi', 'iga',                                       // tier 1
    'foodland', 'drakes', 'foodworks', 'harris_farm', 'spudshed', 'ritchies',   // tier 2
    'seven_eleven', 'nightowl', 'lucky_7', 'bp', 'ampol', 'shell', 'mobil', 'united', 'otr', // derived
  ];

  for (const code of order) {
    const strategy = getStrategy(code);
    if (!strategy) {
      log(`  ⤵ ${code}: no strategy registered, skipping`);
      continue;
    }
    try {
      const result = await strategy.scrape({ gemini, knownPrices, log });
      results.push(result);
      knownPrices.push(...result.prices);
      if (writer) {
        const runId = await writer.insertScrapeRun(result);
        if (runId) await writer.insertPrices(runId, result.prices);
      }
    } catch (err) {
      log(`  ✗ ${code} threw: ${(err as Error).message}`);
    }
  }

  return results;
}
