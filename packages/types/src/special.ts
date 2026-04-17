import { z } from 'zod';
import { RetailerCode } from './retailer.js';

/** Promotion mechanism. */
export const SpecialType = z.enum([
  'half_price',
  'dollar_off',
  'percent_off',
  'multi_buy', // e.g. "2 for $6"
  'member_only',
  'clearance',
  'bundle',
  'price_match',
]);
export type SpecialType = z.infer<typeof SpecialType>;

export const Special = z.object({
  id: z.string().uuid(),
  retailerCode: RetailerCode,
  type: SpecialType,
  /** Human-readable description as it appears in the catalogue. */
  label: z.string(),
  validFrom: z.string().datetime(),
  validTo: z.string().datetime(),
  /** Page or URL where we saw the promotion. */
  sourceUrl: z.string().url(),
  /** If the promo requires a loyalty program code (e.g. "flybuys"). */
  requiredLoyaltyProgram: z.string().nullable().default(null),
  /** For multi-buy: how many units. */
  multiBuyQty: z.number().int().positive().nullable().default(null),
  /** For multi-buy: the total bundle price. */
  multiBuyPrice: z.number().positive().nullable().default(null),
});
export type Special = z.infer<typeof Special>;
