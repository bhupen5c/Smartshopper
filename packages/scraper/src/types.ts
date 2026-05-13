/**
 * Common types for the scraper. The data shape is intentionally the same
 * as the rows we INSERT into Supabase's `prices` table.
 */

import { z } from 'zod';

/** A single price scraped from a retailer for a single product. */
export const ScrapedPrice = z.object({
  retailerCode: z.string(),
  productId: z.string(),
  /** Retailer-specific SKU (e.g. Coles' product ID). Optional. */
  retailerSku: z.string().nullable().optional(),
  price: z.number().nonnegative(),
  /** Pre-special "was" price when the retailer surfaces one. */
  wasPrice: z.number().nonnegative().nullable().optional(),
  /** True if this looks like a genuine special (not a cosmetic "save 5¢"). */
  isTrueSpecial: z.boolean().default(false),
  /** True if the price is only available to loyalty members. */
  memberOnly: z.boolean().default(false),
});
export type ScrapedPrice = z.infer<typeof ScrapedPrice>;

/** Audit metadata for a scrape run. Mirrors the `scrape_runs` Supabase row. */
export interface ScrapeRunResult {
  retailerCode: string;
  kind: 'prices' | 'catalogue' | 'derive';
  startedAt: string;
  finishedAt: string;
  itemsEmitted: number;
  errorsCount: number;
  ok: boolean;
  notes?: string;
  sourceUrl?: string;
  /** The actual scraped rows. Caller persists these to `prices`. */
  prices: ScrapedPrice[];
}

/** Anything that can scrape one retailer end-to-end. */
export interface RetailerStrategy {
  retailerCode: string;
  /**
   * Pulls today's prices for this retailer. Should not throw — wrap
   * errors and report via the returned ScrapeRunResult so the cron
   * worker can record what failed without aborting the whole run.
   */
  scrape(ctx: ScrapeContext): Promise<ScrapeRunResult>;
}

/** Runtime dependencies passed to every strategy. */
export interface ScrapeContext {
  /** Gemini REST client. Strategies may use it for HTML/PDF parsing. */
  gemini: GeminiClient | null;
  /**
   * Latest prices already known from other retailers — useful to
   * 'derived' convenience strategies that mark up the cheapest
   * supermarket price.
   */
  knownPrices: ScrapedPrice[];
  /** Logger. Implementations may simply console.log. */
  log: (msg: string, extra?: Record<string, unknown>) => void;
}

export interface GeminiClient {
  /** Send a text prompt + return parsed JSON (validated against responseSchema). */
  generateJson<T>(args: {
    prompt: string;
    /** Optional URL of an image / PDF / HTML for Gemini Vision. */
    inlineDataUrl?: string;
    inlineDataMimeType?: string;
    responseSchema: z.ZodType<T>;
    model?: string;
  }): Promise<T>;
}
