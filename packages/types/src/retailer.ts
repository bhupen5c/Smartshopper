import { z } from 'zod';

/** Retailer codes we track. Extendable without migration: new entries just become new rows. */
export const RetailerCode = z.enum([
  'coles',
  'woolworths',
  'aldi',
  'iga',
  'costco',
  'chemist_warehouse',
]);
export type RetailerCode = z.infer<typeof RetailerCode>;

export const Retailer = z.object({
  id: z.string().uuid(),
  code: RetailerCode,
  name: z.string(),
  websiteUrl: z.string().url(),
  supportsDelivery: z.boolean(),
  supportsClickAndCollect: z.boolean(),
  supportsDirectToBoot: z.boolean(),
  /** ISO 8601 weekday (1=Mon) that their weekly specials flip. Most AU chains: Wednesday (3). */
  specialsFlipWeekday: z.number().int().min(1).max(7),
  /** Code of the primary loyalty program, if any (flybuys, everyday_rewards...). */
  loyaltyProgramCode: z.string().nullable().default(null),
});
export type Retailer = z.infer<typeof Retailer>;

/** Known AU loyalty programs. */
export const LoyaltyProgramCode = z.enum([
  'flybuys', // Coles, Kmart, Target, Liquorland
  'everyday_rewards', // Woolworths, BWS, Big W
  'priceline_sister_club',
  'costco_membership',
  'iga_rewards',
]);
export type LoyaltyProgramCode = z.infer<typeof LoyaltyProgramCode>;

export const LoyaltyProgram = z.object({
  id: z.string().uuid(),
  code: LoyaltyProgramCode,
  name: z.string(),
  /** How many points equal $1 of redemption value. Flybuys: 2000 pts = $10, so 200 pts/$. */
  pointsPerDollarValue: z.number().positive(),
  /** Points earned per dollar spent (base rate, ignoring boosters). */
  earnRatePerDollar: z.number().nonnegative(),
  /** Optional annual membership cost; non-zero for Costco. */
  annualFee: z.number().nonnegative().default(0),
  retailerCodes: z.array(RetailerCode).min(1),
});
export type LoyaltyProgram = z.infer<typeof LoyaltyProgram>;
