import { z } from 'zod';
import { RetailerCode } from './retailer.js';

/** A flattened catalogue row emitted by a scraper — pre-matching, pre-persistence. */
export const ScrapedCatalogueItem = z.object({
  retailerCode: RetailerCode,
  retailerSku: z.string(),
  name: z.string(),
  brand: z.string().nullable(),
  category: z.string().nullable(),
  size: z.number().positive().nullable(),
  unit: z.string().nullable(),
  gtin: z.string().nullable(),
  productUrl: z.string().url(),
  imageUrl: z.string().url().nullable(),
  price: z.number().positive(),
  wasPrice: z.number().positive().nullable(),
  unitPrice: z.number().positive().nullable(),
  unitPriceMeasure: z.string().nullable(),
  inStock: z.boolean().default(true),
  memberOnly: z.boolean().default(false),
  specialLabel: z.string().nullable(),
  specialValidFrom: z.string().datetime().nullable(),
  specialValidTo: z.string().datetime().nullable(),
  scrapedAt: z.string().datetime(),
});
export type ScrapedCatalogueItem = z.infer<typeof ScrapedCatalogueItem>;

export const ScrapeRunSummary = z.object({
  retailerCode: RetailerCode,
  kind: z.enum(['catalogue', 'specials', 'spot']),
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime(),
  itemsEmitted: z.number().int().nonnegative(),
  errorsCount: z.number().int().nonnegative(),
  ok: z.boolean(),
});
export type ScrapeRunSummary = z.infer<typeof ScrapeRunSummary>;
