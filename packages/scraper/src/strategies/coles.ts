/**
 * Coles strategy. Coles' web app hits a JSON endpoint
 * (`shop.coles.com.au/api/bff/products/search`) that returns product data
 * in a stable schema. Direct fetch sometimes works from Vercel; if Coles
 * fingerprinting returns 403, we fall back to Gemini-on-HTML.
 *
 * This implementation searches by product name (mapped from our
 * CATALOGUE_PRODUCTS) so it's bounded to our seeded SKU list.
 */

import { z } from 'zod';
import type { RetailerStrategy, ScrapeContext, ScrapeRunResult, ScrapedPrice } from '../types.js';

/** Maps our internal product IDs → search terms Coles will recognise. */
const COLES_SEARCH_TERMS: Record<string, string> = {
  p01: 'pauls full cream milk 2l',
  p02: 'devondale tasty cheese block 500g',
  p03: 'chobani greek yoghurt 907g',
  p04: 'western star butter 250g',
  p05: 'tip top bread white 700g',
  p06: 'helgas wholemeal bread 750g',
  p07: 'weet-bix original 1.2kg',
  p08: 'uncle tobys quick oats 1kg',
  p09: 'arnotts tim tam original 200g',
  p11: 'smiths original chips 170g',
  p12: 'cadbury dairy milk block 180g',
  p14: 'coca-cola classic 2l',
  p15: 'pepsi max 2l',
  p16: 'mount franklin water 6 pack',
  p17: 'barilla spaghetti 500g',
  p21: 'bega peanut butter smooth 470g',
  p22: 'csr white sugar 2kg',
  p25: 'john west tuna springwater 95g',
  p36: 'nescafe blend 43 instant coffee 500g',
  p38: 'cage free eggs 12 pack',
  p66: 'coles full cream milk 2l',
  p65: 'coles tasty cheese 500g',
  p70: 'coles basmati rice 1kg',
};

const ColesProduct = z.object({
  _type: z.string().optional(),
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().optional(),
  pricing: z
    .object({
      now: z.number(),
      was: z.number().optional(),
      saveAmount: z.object({ amount: z.number().optional() }).optional(),
    })
    .optional(),
});

const ColesSearchResponse = z.object({
  results: z.array(ColesProduct).optional(),
});

interface ColesScrapeOptions {
  /** Slow scrapes to respect rate limits. Defaults to 800ms between calls. */
  delayMs?: number;
}

export function colesStrategy(opts: ColesScrapeOptions = {}): RetailerStrategy {
  const delayMs = opts.delayMs ?? 800;

  return {
    retailerCode: 'coles',
    async scrape(ctx: ScrapeContext): Promise<ScrapeRunResult> {
      const startedAt = new Date().toISOString();
      const prices: ScrapedPrice[] = [];
      let errors = 0;
      let lastError: string | null = null;

      for (const [productId, term] of Object.entries(COLES_SEARCH_TERMS)) {
        try {
          const url = new URL('https://www.coles.com.au/api/bff/products/search');
          url.searchParams.set('q', term);
          url.searchParams.set('count', '1');

          const res = await fetch(url.toString(), {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36',
              Accept: 'application/json, text/plain, */*',
              'Accept-Language': 'en-AU,en;q=0.9',
            },
          });

          if (!res.ok) {
            errors++;
            lastError = `Coles search ${res.status} for "${term}"`;
            ctx.log(lastError);
            continue;
          }

          const data = ColesSearchResponse.parse(await res.json());
          const top = data.results?.[0];
          if (!top?.pricing?.now) continue;

          prices.push({
            retailerCode: 'coles',
            productId,
            retailerSku: top.id != null ? String(top.id) : null,
            price: top.pricing.now,
            wasPrice: top.pricing.was ?? null,
            // Heuristic: a real special discounts by > 10 %.
            isTrueSpecial:
              top.pricing.was !== undefined &&
              top.pricing.was - top.pricing.now > Math.max(0.5, top.pricing.was * 0.1),
            memberOnly: false,
          });
        } catch (err) {
          errors++;
          lastError = (err as Error).message;
          ctx.log(`Coles error "${term}": ${lastError}`);
        }

        // Polite delay between requests.
        if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
      }

      const finishedAt = new Date().toISOString();
      const ok = prices.length > 0 && errors < Object.keys(COLES_SEARCH_TERMS).length / 2;

      return {
        retailerCode: 'coles',
        kind: 'prices',
        startedAt,
        finishedAt,
        itemsEmitted: prices.length,
        errorsCount: errors,
        ok,
        notes: ok ? `Direct API; ${errors} errors` : `Direct API failed: ${lastError ?? 'no items'}`,
        sourceUrl: 'https://www.coles.com.au/api/bff/products/search',
        prices,
      };
    },
  };
}
