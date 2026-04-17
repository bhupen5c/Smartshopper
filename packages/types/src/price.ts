import { z } from 'zod';

/** A single observation of a retailer's price for one SKU, at a point in time. */
export const PriceSnapshot = z.object({
  id: z.string().uuid().optional(),
  retailerProductId: z.string().uuid(),
  /** Current shelf/web price in AUD. */
  price: z.number().positive(),
  /** Retailer's claimed "was" price (often misleading — we calculate our own baseline). */
  wasPrice: z.number().positive().nullable().default(null),
  /** Price normalised per base unit (e.g. $/100 g or $/L) for cross-size comparison. */
  unitPrice: z.number().positive().nullable().default(null),
  /** Unit the unit price is expressed in. */
  unitPriceMeasure: z.string().max(16).nullable().default(null),
  inStock: z.boolean().default(true),
  /** If this price is only available to loyalty members. */
  memberOnly: z.boolean().default(false),
  /** If part of a named promotion. */
  specialId: z.string().uuid().nullable().default(null),
  /** When the snapshot was captured (source-of-truth ordering key). */
  scrapedAt: z.string().datetime(),
  /** Where the snapshot came from. */
  source: z.enum(['scraper', 'user_submission', 'receipt_ocr', 'admin']).default('scraper'),
});
export type PriceSnapshot = z.infer<typeof PriceSnapshot>;

/**
 * Aggregated price analytics for a retailer product — derived from PriceSnapshot history.
 * Refreshed nightly; cached on the row for cheap reads.
 */
export const PriceAnalytics = z.object({
  retailerProductId: z.string().uuid(),
  /** Current live price. */
  currentPrice: z.number().positive(),
  /** Lowest price seen in the given windows. */
  low30d: z.number().positive().nullable(),
  low90d: z.number().positive().nullable(),
  low365d: z.number().positive().nullable(),
  high365d: z.number().positive().nullable(),
  /** Trimmed-mean non-promotional baseline (ignores sub-p20 outliers). */
  baseline90d: z.number().positive().nullable(),
  /** 0 = cheapest-ever in window, 1 = most expensive. */
  percentileRank90d: z.number().min(0).max(1).nullable(),
  percentileRank365d: z.number().min(0).max(1).nullable(),
  /** Discount vs trimmed baseline, negative = cheaper than baseline. */
  discountVsBaseline: z.number().nullable(),
  /** Detected cycle length in days (0 = no strong cycle). */
  cycleDays: z.number().nonnegative(),
  /** ISO date when we think the next drop is likely, if a cycle was detected. */
  nextPredictedDropAt: z.string().datetime().nullable(),
  /** Whether the current special is judged genuine ("true") or cosmetic. */
  isTrueSpecial: z.boolean(),
  computedAt: z.string().datetime(),
});
export type PriceAnalytics = z.infer<typeof PriceAnalytics>;
