import { z } from 'zod';
import { FulfilmentQuote } from './delivery.js';
import { RetailerCode } from './retailer.js';

/** One line of a priced plan. */
export const BasketLine = z.object({
  listItemId: z.string().uuid(),
  productId: z.string().uuid(),
  productName: z.string(),
  retailerCode: RetailerCode,
  retailerProductId: z.string().uuid(),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  /** Shelf price × quantity, before any promotions. */
  lineSubtotal: z.number().nonnegative(),
  /** Post-promotion line total. */
  lineTotal: z.number().nonnegative(),
  isTrueSpecial: z.boolean().default(false),
  memberOnly: z.boolean().default(false),
  /** Optional cheaper substitute ranked with its confidence. */
  substitute: z
    .object({
      productId: z.string().uuid(),
      productName: z.string(),
      price: z.number().nonnegative(),
      confidence: z.number().min(0).max(1),
    })
    .nullable()
    .default(null),
});
export type BasketLine = z.infer<typeof BasketLine>;

/** Ranked purchase plan: one or more retailers, priced, timed and distance-costed. */
export const BasketPlan = z.object({
  id: z.string().uuid(),
  /** Kind of plan — single-retailer baseline or multi-retailer optimisation. */
  kind: z.enum(['single_retailer', 'multi_retailer', 'delivery_only']),
  /** Subtotal of all lines (post promo, pre fees). */
  subtotal: z.number().nonnegative(),
  /** Per-retailer fulfilment choices included in this plan. */
  fulfilments: z.array(FulfilmentQuote).min(1),
  /** Total travel cost across all stores visited. */
  totalTravelCost: z.number().nonnegative(),
  /** Total fees across fulfilments. */
  totalFees: z.number().nonnegative(),
  /** Total loyalty rebate across fulfilments. */
  totalLoyaltyRebate: z.number().nonnegative(),
  /** Total time cost across all stores. */
  totalTimeCost: z.number().nonnegative(),
  /** Everything: subtotal + fees + travel + time − loyalty. */
  grandTotal: z.number().nonnegative(),
  /** Money saved vs the most expensive plan in the same ranking. */
  savingsVsWorst: z.number().nonnegative().default(0),
  lines: z.array(BasketLine),
  explanation: z.string(),
});
export type BasketPlan = z.infer<typeof BasketPlan>;

/** User-supplied preferences for optimising a basket. */
export const BasketPreferences = z.object({
  /** Home lat/lng — all distances calculated from here. */
  origin: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    postcode: z.string().regex(/^\d{4}$/).optional(),
  }),
  /** Max number of stores the user is willing to visit in one trip. */
  maxStores: z.number().int().min(1).max(5).default(2),
  /** Max one-way travel distance from home, km. */
  maxTravelKm: z.number().positive().default(10),
  /** Fuel & wear cost per km, AUD. Default = ATO 2025-26 cents-per-km rate ($0.88). */
  fuelCostPerKm: z.number().nonnegative().default(0.88),
  /** User's time value, $/hour. */
  timeValuePerHour: z.number().nonnegative().default(25),
  /** Only consider these retailers (empty = all). */
  allowedRetailers: z.array(RetailerCode).default([]),
  /** Loyalty programs the user holds. */
  loyaltyMemberships: z.array(z.string()).default([]),
  /** Subscription codes the user already pays for (e.g. Woolies Delivery Unlimited). */
  activeSubscriptions: z.array(z.string()).default([]),
  /** If true, prefer the user's named stores over generic nearest matches. */
  preferredStoreIds: z.array(z.string().uuid()).default([]),
  /** If true, only show delivery/click-and-collect options (no in-store trips). */
  noCarAvailable: z.boolean().default(false),
});
export type BasketPreferences = z.infer<typeof BasketPreferences>;
