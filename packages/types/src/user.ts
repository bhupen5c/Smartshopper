import { z } from 'zod';

export const UserAddress = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  label: z.string().max(40).default('Home'),
  addressLine1: z.string(),
  addressLine2: z.string().nullable().default(null),
  suburb: z.string(),
  state: z.enum(['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT']),
  postcode: z.string().regex(/^\d{4}$/),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  isDefault: z.boolean().default(true),
});
export type UserAddress = z.infer<typeof UserAddress>;

export const User = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  createdAt: z.string().datetime(),
  /** Loyalty program memberships (program code → member number, optional). */
  loyalty: z
    .array(
      z.object({
        programCode: z.string(),
        memberNumber: z.string().nullable().default(null),
        pointsBalance: z.number().nonnegative().default(0),
      }),
    )
    .default([]),
  /** Active subscriptions to delivery plans (e.g. Delivery Unlimited). */
  subscriptions: z.array(z.string()).default([]),
  addresses: z.array(UserAddress).default([]),
});
export type User = z.infer<typeof User>;

export const PriceAlert = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  productId: z.string().uuid(),
  /** Trigger when the price drops at or below this amount. */
  targetPrice: z.number().positive(),
  /** Only consider retailers in this list (empty = any). */
  retailerCodes: z.array(z.string()).default([]),
  /** Or trigger when price reaches a percentile rank this low (0.05 = "cheapest 5% of the year"). */
  targetPercentileRank: z.number().min(0).max(1).nullable().default(null),
  active: z.boolean().default(true),
  createdAt: z.string().datetime(),
});
export type PriceAlert = z.infer<typeof PriceAlert>;
