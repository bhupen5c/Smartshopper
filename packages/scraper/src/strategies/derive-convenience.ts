/**
 * Derived strategy: not actually a scrape. Takes today's already-scraped
 * supermarket prices (passed via ctx.knownPrices) and produces convenience-
 * store prices by applying the retailer's `derived_markup` to the cheapest
 * supermarket price for each product.
 *
 * Why: convenience stores (7-Eleven, BP, Ampol, etc.) don't publish online
 * catalogues. Their prices are roughly the supermarket base × 1.3–1.6 for
 * top-up SKUs. This keeps the per-line "all prices" strip on /shop/results
 * filled with realistic numbers without scraping anything.
 *
 * The list of products convenience stores actually carry is small —
 * milk, bread, soft drinks, chocolate, chips, eggs, basic toiletries.
 * Hard-coded here.
 */

import type { RetailerStrategy, ScrapedPrice, ScrapeContext, ScrapeRunResult } from '../types.js';

/** Product IDs that convenience stores typically stock. */
const TOP_UP_PRODUCT_IDS = [
  'p01', // Milk 2L
  'p05', // Bread
  'p09', // Tim Tams
  'p11', // Chips
  'p12', // Cadbury Dairy Milk
  'p14', // Coke 2L
  'p15', // Pepsi Max
  'p16', // Water 6pk
  'p25', // Tuna can
  'p35', // Toothpaste
  'p36', // Instant coffee
  'p38', // Eggs 12pk
] as const;

export interface DeriveConvenienceConfig {
  retailerCode: string;
  /** e.g. 1.50 → 50 % markup over the cheapest supermarket price. */
  markup: number;
  /** Optional subset of products this chain actually stocks. */
  productIds?: readonly string[];
}

export function deriveConvenienceStrategy(cfg: DeriveConvenienceConfig): RetailerStrategy {
  return {
    retailerCode: cfg.retailerCode,
    async scrape(ctx: ScrapeContext): Promise<ScrapeRunResult> {
      const startedAt = new Date().toISOString();
      const productIds = cfg.productIds ?? TOP_UP_PRODUCT_IDS;

      // For each product, find the cheapest supermarket price we know about.
      const cheapestByProduct = new Map<string, number>();
      for (const p of ctx.knownPrices) {
        if (p.isTrueSpecial) continue; // ignore loss-leader specials
        if (p.memberOnly) continue;
        const cur = cheapestByProduct.get(p.productId);
        if (cur === undefined || p.price < cur) {
          cheapestByProduct.set(p.productId, p.price);
        }
      }

      const prices: ScrapedPrice[] = [];
      for (const productId of productIds) {
        const base = cheapestByProduct.get(productId);
        if (base === undefined) continue;
        prices.push({
          retailerCode: cfg.retailerCode,
          productId,
          price: Math.round(base * cfg.markup * 100) / 100,
          isTrueSpecial: false,
          memberOnly: false,
        });
      }

      ctx.log(`derive ${cfg.retailerCode} → ${prices.length} items × ${cfg.markup}`);

      return {
        retailerCode: cfg.retailerCode,
        kind: 'derive',
        startedAt,
        finishedAt: new Date().toISOString(),
        itemsEmitted: prices.length,
        errorsCount: 0,
        ok: true,
        notes: `Derived from supermarket base at ${cfg.markup}× markup`,
        prices,
      };
    },
  };
}
