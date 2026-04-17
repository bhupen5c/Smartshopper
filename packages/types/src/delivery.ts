import { z } from 'zod';
import { RetailerCode } from './retailer.js';

/** How the basket is fulfilled. */
export const FulfilmentMode = z.enum([
  'delivery',
  'click_and_collect',
  'direct_to_boot',
  'in_store_pickup',
]);
export type FulfilmentMode = z.infer<typeof FulfilmentMode>;

/**
 * Delivery / pickup policy for a retailer. Most AU retailers use tiered fees
 * (e.g. $9 at 6am, $11 at 5pm) and a free-delivery threshold.
 */
export const DeliveryPolicy = z.object({
  retailerCode: RetailerCode,
  /** Minimum basket subtotal before they will deliver at all. */
  minimumSpend: z.number().nonnegative(),
  /** Free-delivery threshold; null if there's no such perk. */
  freeDeliveryThreshold: z.number().positive().nullable(),
  /** Fallback flat fee if no tier matches. */
  defaultDeliveryFee: z.number().nonnegative(),
  /** Delivery-fee tiers by window, first match wins. */
  tiers: z
    .array(
      z.object({
        label: z.string(),
        /** Local time window, HH:mm-HH:mm. */
        windowStart: z.string().regex(/^\d{2}:\d{2}$/),
        windowEnd: z.string().regex(/^\d{2}:\d{2}$/),
        fee: z.number().nonnegative(),
        weekdays: z.array(z.number().int().min(0).max(6)).min(1),
      }),
    )
    .default([]),
  /** Subscription plans that reduce or remove the fee. */
  subscriptions: z
    .array(
      z.object({
        code: z.string(),
        label: z.string(),
        monthlyCost: z.number().nonnegative(),
        reducesFeeToZero: z.boolean(),
      }),
    )
    .default([]),
  /** Click-and-collect fee (free at most chains, but some charge small baskets). */
  clickAndCollectFee: z.number().nonnegative().default(0),
  clickAndCollectMinimum: z.number().nonnegative().default(0),
});
export type DeliveryPolicy = z.infer<typeof DeliveryPolicy>;

/** A concrete, priced fulfilment option produced by the recommender. */
export const FulfilmentQuote = z.object({
  retailerCode: RetailerCode,
  storeId: z.string().uuid().nullable(),
  mode: FulfilmentMode,
  basketSubtotal: z.number().nonnegative(),
  /** Delivery or collection fee paid to the retailer. */
  fee: z.number().nonnegative(),
  /** Driving distance in km from user's location to the store (0 for delivery). */
  distanceKm: z.number().nonnegative(),
  /** Estimated round-trip driving time, minutes (0 for delivery). */
  roundTripMinutes: z.number().nonnegative(),
  /** Estimated time in-store (0 for click-and-collect / direct-to-boot / delivery). */
  inStoreMinutes: z.number().nonnegative(),
  /** Fuel + wear-and-tear cost, $/km × distance × 2 for round trip. */
  travelCost: z.number().nonnegative(),
  /** Time cost, minutes × hourly value / 60. */
  timeCost: z.number().nonnegative(),
  /** Loyalty points rebate in AUD (earnRate × subtotal × points-per-dollar value). */
  loyaltyRebate: z.number().nonnegative(),
  /** Grand total — what the user is effectively paying, time and travel included. */
  totalCost: z.number().nonnegative(),
  /** Why this option ranked where it did, plain English. */
  explanation: z.string(),
});
export type FulfilmentQuote = z.infer<typeof FulfilmentQuote>;
