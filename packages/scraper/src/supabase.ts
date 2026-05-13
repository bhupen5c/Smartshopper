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
