/**
 * Generic Gemini-HTML strategy. Fetches a catalogue page, passes the HTML
 * (trimmed to a sensible window) to Gemini, asks for a price table for
 * the product IDs we care about.
 *
 * Used for retailers that don't expose a clean JSON API: IGA, FoodWorks,
 * Foodland, Drakes, Harris Farm, Romeo's, etc. Falls through to "no
 * prices, ok: false" if Gemini isn't configured.
 */

import { z } from 'zod';
import type { RetailerStrategy, ScrapeContext, ScrapeRunResult, ScrapedPrice } from '../types.js';

interface GeminiHtmlConfig {
  retailerCode: string;
  catalogueUrl: string;
  /** Product IDs we want prices for, with hint terms to give Gemini context. */
  products: Array<{ productId: string; hint: string }>;
}

const ExtractionResult = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      price: z.number().nonnegative().nullable(),
      wasPrice: z.number().nonnegative().nullable().optional(),
      isTrueSpecial: z.boolean().default(false),
    }),
  ),
});

export function geminiHtmlStrategy(cfg: GeminiHtmlConfig): RetailerStrategy {
  return {
    retailerCode: cfg.retailerCode,
    async scrape(ctx: ScrapeContext): Promise<ScrapeRunResult> {
      const startedAt = new Date().toISOString();

      if (!ctx.gemini) {
        return {
          retailerCode: cfg.retailerCode,
          kind: 'prices',
          startedAt,
          finishedAt: new Date().toISOString(),
          itemsEmitted: 0,
          errorsCount: 1,
          ok: false,
          notes: 'GEMINI_API_KEY not set — skipped',
          sourceUrl: cfg.catalogueUrl,
          prices: [],
        };
      }

      try {
        const html = await fetchHtml(cfg.catalogueUrl);
        const trimmed = trimHtml(html);

        const prompt = buildPrompt(cfg.retailerCode, cfg.products, trimmed);
        const result = await ctx.gemini.generateJson({
          prompt,
          responseSchema: ExtractionResult,
        });

        const prices: ScrapedPrice[] = [];
        for (const item of result.items) {
          if (item.price === null || item.price <= 0) continue;
          prices.push({
            retailerCode: cfg.retailerCode,
            productId: item.productId,
            price: item.price,
            wasPrice: item.wasPrice ?? null,
            isTrueSpecial: item.isTrueSpecial,
            memberOnly: false,
          });
        }

        ctx.log(`${cfg.retailerCode} (gemini_html) → ${prices.length} items`);

        return {
          retailerCode: cfg.retailerCode,
          kind: 'prices',
          startedAt,
          finishedAt: new Date().toISOString(),
          itemsEmitted: prices.length,
          errorsCount: 0,
          ok: prices.length > 0,
          notes: `Gemini HTML extraction (${trimmed.length} chars)`,
          sourceUrl: cfg.catalogueUrl,
          prices,
        };
      } catch (err) {
        return {
          retailerCode: cfg.retailerCode,
          kind: 'prices',
          startedAt,
          finishedAt: new Date().toISOString(),
          itemsEmitted: 0,
          errorsCount: 1,
          ok: false,
          notes: (err as Error).message.slice(0, 200),
          sourceUrl: cfg.catalogueUrl,
          prices: [],
        };
      }
    },
  };
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-AU,en;q=0.9',
    },
  });
  if (!res.ok) throw new Error(`fetch ${url} → ${res.status}`);
  return res.text();
}

/** Strip script/style + collapse whitespace. Keeps Gemini token-budget under control. */
function trimHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 200_000); // ~50k tokens — safe for Gemini Flash
}

function buildPrompt(
  retailerCode: string,
  products: Array<{ productId: string; hint: string }>,
  html: string,
): string {
  const list = products.map((p) => `  - ${p.productId}: ${p.hint}`).join('\n');
  return `You are extracting current product prices from an Australian retailer's catalogue HTML.

Retailer: ${retailerCode}

Find the current price (in AUD) for each of these products. Match by name/brand/size:
${list}

Rules:
- Return price as a number, e.g. 3.50 — never a string.
- If the product isn't on the page or you can't find a confident price, set price to null.
- If the page shows both "was" and "now" prices, return the now price + the wasPrice. Set isTrueSpecial=true when the discount is > 10 %.
- Don't invent prices.

Catalogue HTML (truncated):
${html}

Return ONLY valid JSON matching: { "items": [ { "productId": string, "price": number|null, "wasPrice": number|null, "isTrueSpecial": boolean } ] }`;
}
