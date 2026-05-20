/**
 * @smartshopper/scraper — daily price scraping pipeline.
 *
 * Config-driven: the `retailers` table in Supabase says which retailers
 * to scrape, with what `scraping_strategy`, and (for PDF retailers) the
 * `catalogue_url` to read. Changing a catalogue URL is a DB update, not
 * a deploy.
 *
 * Strategy column → implementation:
 *   - 'gemini_pdf'  → strategies/gemini-pdf.ts   (catalogue PDF + Gemini Vision)
 *   - 'gemini_html' → strategies/gemini-html.ts  (HTML catalogue + Gemini)
 *   - 'derived'     → strategies/derive-convenience.ts (markup over supermarket base)
 *   - 'direct_api' / 'none' → skipped (no working implementation)
 *
 * Public API:
 *   - `runRetailer(code, deps)` — scrape one retailer end-to-end
 *   - `runAll(deps)` — scrape every active retailer (supermarkets first)
 */

import type { RetailerStrategy, ScrapeRunResult, ScrapedPrice } from './types.js';
import { createGeminiClient } from './gemini.js';
import {
  createSupabaseWriter,
  fetchScrapeConfig,
  type SupabaseWriter,
  type RetailerConfig,
  type ProductConfig,
} from './supabase.js';
import { deriveConvenienceStrategy } from './strategies/derive-convenience.js';
import { geminiHtmlStrategy } from './strategies/gemini-html.js';
import { geminiPdfStrategy } from './strategies/gemini-pdf.js';

export * from './types.js';
export { createGeminiClient } from './gemini.js';
export { createSupabaseWriter, fetchScrapeConfig } from './supabase.js';

/** Dependencies for running scrapers. Defaults read from env. */
export interface ScraperDeps {
  geminiApiKey?: string;
  supabaseUrl?: string;
  supabaseServiceKey?: string;
  /** When true, run strategies + read config but don't write results. */
  dryRun?: boolean;
  log?: (msg: string, extra?: Record<string, unknown>) => void;
}

interface Resolved {
  gemini: ReturnType<typeof createGeminiClient>;
  writer: SupabaseWriter | null;
  supabaseUrl: string | undefined;
  supabaseKey: string | undefined;
  log: (msg: string, extra?: Record<string, unknown>) => void;
}

function resolve(deps: ScraperDeps): Resolved {
  const supabaseUrl =
    deps.supabaseUrl ?? process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = deps.supabaseServiceKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  return {
    gemini: createGeminiClient(deps.geminiApiKey ?? process.env.GEMINI_API_KEY),
    // dryRun reads config but writes nothing.
    writer: deps.dryRun ? null : createSupabaseWriter(supabaseUrl, supabaseKey),
    supabaseUrl,
    supabaseKey,
    log: deps.log ?? ((msg) => console.log(`[scraper] ${msg}`)),
  };
}

/**
 * List the codes of every active retailer that has a runnable strategy.
 * Used by the cron fan-out to know what to enqueue.
 */
export async function listActiveRetailers(deps: ScraperDeps): Promise<string[]> {
  const { supabaseUrl, supabaseKey } = resolve(deps);
  const config = await fetchScrapeConfig(supabaseUrl, supabaseKey);
  if (!config) return [];
  return config.retailers
    .filter((r) => strategyFor(r, config.products) !== null)
    .map((r) => r.code);
}

/** Build the strategy for a retailer from its DB config. */
function strategyFor(
  retailer: RetailerConfig,
  products: ProductConfig[],
): RetailerStrategy | null {
  switch (retailer.scrapingStrategy) {
    case 'gemini_pdf':
      if (!retailer.catalogueUrl) return null;
      return geminiPdfStrategy({
        retailerCode: retailer.code,
        catalogueUrl: retailer.catalogueUrl,
        products: products.map((p) => ({
          productId: p.id,
          description: `${p.brand} ${p.name} ${p.size ?? ''}`.trim(),
        })),
      });
    case 'gemini_html':
      if (!retailer.catalogueUrl) return null;
      return geminiHtmlStrategy({
        retailerCode: retailer.code,
        catalogueUrl: retailer.catalogueUrl,
        products: products.map((p) => ({
          productId: p.id,
          hint: `${p.brand} ${p.name} ${p.size ?? ''}`.trim(),
        })),
      });
    case 'derived':
      return deriveConvenienceStrategy({
        retailerCode: retailer.code,
        markup: retailer.derivedMarkup ?? 1.5,
      });
    default:
      // 'direct_api', 'none', or anything unrecognised — no scrape.
      return null;
  }
}

/** Persist a strategy result to Supabase. Returns rows written. */
async function persist(writer: SupabaseWriter | null, result: ScrapeRunResult): Promise<number> {
  if (!writer) return 0;
  const runId = await writer.insertScrapeRun(result);
  if (!runId) return 0;
  return writer.insertPrices(runId, result.prices);
}

/**
 * Scrape one retailer end-to-end. Reads config from Supabase to find the
 * retailer's strategy + catalogue URL.
 */
export async function runRetailer(
  retailerCode: string,
  deps: ScraperDeps,
): Promise<ScrapeRunResult> {
  const { gemini, writer, supabaseUrl, supabaseKey, log } = resolve(deps);

  const config = await fetchScrapeConfig(supabaseUrl, supabaseKey);
  if (!config) throw new Error('Cannot read scrape config — Supabase not configured');

  const retailer = config.retailers.find((r) => r.code === retailerCode);
  if (!retailer) throw new Error(`Retailer ${retailerCode} not found / not active`);

  const strategy = strategyFor(retailer, config.products);
  if (!strategy) {
    throw new Error(
      `No runnable strategy for ${retailerCode} (strategy=${retailer.scrapingStrategy}, catalogue_url=${retailer.catalogueUrl ?? 'none'})`,
    );
  }

  log(`▶ scraping ${retailerCode} via ${retailer.scrapingStrategy}`);
  const result = await strategy.scrape({ gemini, knownPrices: [], log });
  const written = await persist(writer, result);
  log(`  ${result.ok ? '✓' : '✗'} ${retailerCode}: ${result.itemsEmitted} items, ${written} written`);
  return result;
}

/**
 * Scrape every active retailer. Supermarkets + indies first (so their
 * prices feed the derived convenience strategies), derived retailers last.
 */
export async function runAll(deps: ScraperDeps): Promise<ScrapeRunResult[]> {
  const { gemini, writer, supabaseUrl, supabaseKey, log } = resolve(deps);

  const config = await fetchScrapeConfig(supabaseUrl, supabaseKey);
  if (!config) throw new Error('Cannot read scrape config — Supabase not configured');

  // Two passes: real scrapes first so knownPrices is populated, then derived.
  const realRetailers = config.retailers.filter((r) => r.scrapingStrategy !== 'derived');
  const derivedRetailers = config.retailers.filter((r) => r.scrapingStrategy === 'derived');

  const results: ScrapeRunResult[] = [];
  const knownPrices: ScrapedPrice[] = [];

  for (const retailer of [...realRetailers, ...derivedRetailers]) {
    const strategy = strategyFor(retailer, config.products);
    if (!strategy) {
      log(`  ⤵ ${retailer.code}: no runnable strategy (${retailer.scrapingStrategy}), skipping`);
      continue;
    }
    try {
      const result = await strategy.scrape({ gemini, knownPrices, log });
      results.push(result);
      knownPrices.push(...result.prices);
      await persist(writer, result);
    } catch (err) {
      log(`  ✗ ${retailer.code} threw: ${(err as Error).message}`);
    }
  }

  return results;
}
