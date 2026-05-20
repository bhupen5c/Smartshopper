/**
 * Service-role Supabase writer used by the scraper to record runs + prices.
 * Always called from server-side / CLI / cron — never from the browser.
 */

import { createClient } from '@supabase/supabase-js';
import type { ScrapeRunResult, ScrapedPrice } from './types.js';

export interface SupabaseWriter {
  insertScrapeRun(result: ScrapeRunResult): Promise<number | null>;
  insertPrices(scrapeRunId: number, prices: ScrapedPrice[]): Promise<number>;
}

/** Retailer row as the scraper needs it. */
export interface RetailerConfig {
  code: string;
  displayName: string;
  kind: string;
  scrapingStrategy: string;
  catalogueUrl: string | null;
  derivedMarkup: number | null;
  isActive: boolean;
}

/** Product row as the scraper needs it. */
export interface ProductConfig {
  id: string;
  name: string;
  brand: string;
  size: string | null;
}

export interface ScrapeConfig {
  retailers: RetailerConfig[];
  products: ProductConfig[];
}

/**
 * Read the retailer + product config from Supabase. The scraper is
 * config-driven: which retailers to scrape, with what strategy, and
 * (for PDF retailers) which catalogue URL — all live in the DB so they
 * can be changed without a deploy.
 */
export async function fetchScrapeConfig(
  url: string | undefined,
  key: string | undefined,
): Promise<ScrapeConfig | null> {
  if (!url || !key) return null;
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const [retailersRes, productsRes] = await Promise.all([
    supabase
      .from('retailers')
      .select('code, display_name, kind, scraping_strategy, catalogue_url, derived_markup, is_active')
      .eq('is_active', true),
    supabase.from('products').select('id, name, brand, size'),
  ]);

  if (retailersRes.error) {
    console.error('fetchScrapeConfig retailers error:', retailersRes.error.message);
    return null;
  }
  if (productsRes.error) {
    console.error('fetchScrapeConfig products error:', productsRes.error.message);
    return null;
  }

  return {
    retailers: (retailersRes.data ?? []).map((r) => ({
      code: r.code,
      displayName: r.display_name,
      kind: r.kind,
      scrapingStrategy: r.scraping_strategy,
      catalogueUrl: r.catalogue_url,
      derivedMarkup: r.derived_markup,
      isActive: r.is_active,
    })),
    products: (productsRes.data ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      size: p.size,
    })),
  };
}

export function createSupabaseWriter(
  url: string | undefined,
  serviceKey: string | undefined,
): SupabaseWriter | null {
  if (!url || !serviceKey) return null;
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return {
    async insertScrapeRun(result) {
      const { data, error } = await supabase
        .from('scrape_runs')
        .insert({
          retailer_code: result.retailerCode,
          kind: result.kind,
          started_at: result.startedAt,
          finished_at: result.finishedAt,
          items_emitted: result.itemsEmitted,
          errors_count: result.errorsCount,
          ok: result.ok,
          notes: result.notes ?? null,
          source_url: result.sourceUrl ?? null,
        })
        .select('id')
        .single();

      if (error) {
        console.error('insertScrapeRun error:', error.message);
        return null;
      }
      return data?.id ?? null;
    },

    async insertPrices(scrapeRunId, prices) {
      if (prices.length === 0) return 0;
      const rows = prices.map((p) => ({
        retailer_code: p.retailerCode,
        product_id: p.productId,
        retailer_sku: p.retailerSku ?? null,
        price: p.price,
        was_price: p.wasPrice ?? null,
        is_true_special: p.isTrueSpecial,
        member_only: p.memberOnly,
        scrape_run_id: scrapeRunId,
      }));
      const { error, count } = await supabase
        .from('prices')
        .insert(rows, { count: 'exact' });
      if (error) {
        console.error('insertPrices error:', error.message);
        return 0;
      }
      return count ?? rows.length;
    },
  };
}
