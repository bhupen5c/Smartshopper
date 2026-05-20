/**
 * Catalogue-PDF strategy. Downloads a retailer's weekly specials catalogue
 * (a PDF), hands it to Gemini Vision, and asks for a price table matching
 * our product list.
 *
 * Why PDFs and not live HTML: AU supermarket sites are JS-rendered and
 * bot-protected, so a server-side `fetch()` of a product page returns an
 * empty shell. Weekly catalogues are static PDF files — no JS, far less
 * bot-protection — and Gemini 2.5 Flash reads PDFs natively (it sees the
 * page images + text layer).
 *
 * The PDF URL comes from the retailer's `catalogue_url` column in
 * Supabase, so it can be refreshed weekly without a code deploy.
 */

import { z } from 'zod';
import type { RetailerStrategy, ScrapeContext, ScrapeRunResult, ScrapedPrice } from '../types.js';

export interface GeminiPdfConfig {
  retailerCode: string;
  /** Direct URL to the catalogue PDF. */
  catalogueUrl: string;
  /** Products we want prices for — id + human description for matching. */
  products: Array<{ productId: string; description: string }>;
}

/** Gemini's structured output: one row per product it could price. */
const ExtractionResult = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      price: z.number().nonnegative().nullable(),
      wasPrice: z.number().nonnegative().nullable().optional(),
      isTrueSpecial: z.boolean().default(false),
      memberOnly: z.boolean().default(false),
    }),
  ),
});

/** Inline-data ceiling — Gemini rejects requests whose total payload is
 *  too large. ~18 MB of raw PDF ≈ 24 MB base64, safely under the limit. */
const MAX_PDF_BYTES = 18 * 1024 * 1024;

export function geminiPdfStrategy(cfg: GeminiPdfConfig): RetailerStrategy {
  return {
    retailerCode: cfg.retailerCode,
    async scrape(ctx: ScrapeContext): Promise<ScrapeRunResult> {
      const startedAt = new Date().toISOString();
      const fail = (notes: string): ScrapeRunResult => ({
        retailerCode: cfg.retailerCode,
        kind: 'catalogue',
        startedAt,
        finishedAt: new Date().toISOString(),
        itemsEmitted: 0,
        errorsCount: 1,
        ok: false,
        notes: notes.slice(0, 240),
        sourceUrl: cfg.catalogueUrl,
        prices: [],
      });

      if (!ctx.gemini) return fail('GEMINI_API_KEY not set — skipped');
      if (!cfg.catalogueUrl) return fail('No catalogue_url configured for this retailer');
      if (cfg.products.length === 0) return fail('No products to look for');

      // Fetch the PDF ourselves so we can validate it before spending a
      // Gemini call — and so a 404 / HTML-instead-of-PDF fails cleanly.
      let pdfBytes: ArrayBuffer;
      let contentType: string;
      try {
        const res = await fetch(cfg.catalogueUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36',
            Accept: 'application/pdf,*/*',
          },
        });
        if (!res.ok) return fail(`catalogue fetch ${cfg.catalogueUrl} → ${res.status}`);
        contentType = res.headers.get('content-type') ?? '';
        pdfBytes = await res.arrayBuffer();
      } catch (err) {
        return fail(`catalogue fetch threw: ${(err as Error).message}`);
      }

      if (!contentType.includes('pdf') && !looksLikePdf(pdfBytes)) {
        return fail(
          `catalogue_url did not return a PDF (content-type: ${contentType || 'unknown'}). ` +
            'Point catalogue_url at a direct .pdf link.',
        );
      }
      if (pdfBytes.byteLength > MAX_PDF_BYTES) {
        return fail(`catalogue PDF too large (${Math.round(pdfBytes.byteLength / 1e6)} MB > 18 MB)`);
      }

      // Hand the PDF to Gemini Vision.
      let result: z.infer<typeof ExtractionResult>;
      try {
        result = await ctx.gemini.generateJson({
          prompt: buildPrompt(cfg.retailerCode, cfg.products),
          inlineDataBase64: Buffer.from(pdfBytes).toString('base64'),
          inlineDataMimeType: 'application/pdf',
          responseSchema: ExtractionResult,
        });
      } catch (err) {
        return fail(`Gemini extraction failed: ${(err as Error).message}`);
      }

      const prices: ScrapedPrice[] = [];
      const wanted = new Set(cfg.products.map((p) => p.productId));
      for (const item of result.items) {
        if (!wanted.has(item.productId)) continue; // ignore hallucinated IDs
        if (item.price === null || item.price <= 0) continue;
        prices.push({
          retailerCode: cfg.retailerCode,
          productId: item.productId,
          price: item.price,
          wasPrice: item.wasPrice ?? null,
          isTrueSpecial: item.isTrueSpecial,
          memberOnly: item.memberOnly,
        });
      }

      ctx.log(`${cfg.retailerCode} (gemini_pdf) → ${prices.length}/${cfg.products.length} priced`);

      return {
        retailerCode: cfg.retailerCode,
        kind: 'catalogue',
        startedAt,
        finishedAt: new Date().toISOString(),
        itemsEmitted: prices.length,
        errorsCount: 0,
        ok: prices.length > 0,
        notes: `Gemini PDF extraction — ${prices.length} of ${cfg.products.length} products priced (${Math.round(pdfBytes.byteLength / 1e3)} KB PDF)`,
        sourceUrl: cfg.catalogueUrl,
        prices,
      };
    },
  };
}

/** PDF magic number is "%PDF". Cheap sanity check when content-type lies. */
function looksLikePdf(bytes: ArrayBuffer): boolean {
  const head = new Uint8Array(bytes.slice(0, 5));
  return head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46;
}

function buildPrompt(
  retailerCode: string,
  products: Array<{ productId: string; description: string }>,
): string {
  const list = products.map((p) => `  - ${p.productId}: ${p.description}`).join('\n');
  return `You are reading an Australian supermarket's weekly specials catalogue (a PDF).

Retailer: ${retailerCode}

Find the current shelf price (in AUD) for each of these products. Match on
brand, product name and pack size — be strict, don't match a different size
or a different brand.

${list}

Rules:
- price is a number, e.g. 3.50 — never a string, never with a "$".
- If a product is not in this catalogue, set its price to null. Do NOT guess.
- If the catalogue shows a struck-through "was" price and a lower "now"
  price, return price = the now price and wasPrice = the was price, and set
  isTrueSpecial = true when the discount is more than 10%.
- Set memberOnly = true only if the price is explicitly flagged as a
  loyalty-member / card price (Flybuys, Everyday Rewards, etc.).
- Only return productId values from the list above.

Return ONLY valid JSON: { "items": [ { "productId": string, "price": number|null, "wasPrice": number|null, "isTrueSpecial": boolean, "memberOnly": boolean } ] }`;
}
