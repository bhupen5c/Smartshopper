import { z } from 'zod';
import { RetailerCode } from './retailer.js';

/** Measurement unit on a product size. */
export const ProductUnit = z.enum(['g', 'kg', 'ml', 'l', 'ea', 'pk', 'm']);
export type ProductUnit = z.infer<typeof ProductUnit>;

/**
 * Canonical product — a single SKU *across* retailers.
 * Most rows join on GTIN/barcode. When no barcode is available (e.g. fresh produce), we match on
 * a fuzzy key of (brand + name + size + unit) and flag `matchConfidence`.
 */
export const Product = z.object({
  id: z.string().uuid(),
  gtin: z.string().regex(/^\d{8}$|^\d{12,14}$/).nullable(),
  name: z.string().min(1).max(200),
  brand: z.string().max(120).nullable(),
  category: z.string().max(120).nullable(),
  /** e.g. 500 for "500 g Tim Tams". */
  size: z.number().positive().nullable(),
  unit: ProductUnit.nullable(),
  /** Confidence that products mapped to this canonical row are truly the same thing, 0..1. */
  matchConfidence: z.number().min(0).max(1).default(1),
  imageUrl: z.string().url().nullable().default(null),
});
export type Product = z.infer<typeof Product>;

/** Retailer-specific SKU pointing back at a canonical Product. */
export const RetailerProduct = z.object({
  id: z.string().uuid(),
  retailerCode: RetailerCode,
  retailerSku: z.string().min(1).max(64),
  productId: z.string().uuid(),
  productUrl: z.string().url(),
  lastSeenAt: z.string().datetime(),
  deleted: z.boolean().default(false),
});
export type RetailerProduct = z.infer<typeof RetailerProduct>;
