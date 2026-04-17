/**
 * Hardcoded catalogue of the major AU supermarket loyalty programs.
 * Values are as at early 2026 and are easily overridden from the database at runtime.
 *
 * Redemption value notes:
 * - Flybuys: 2000 pts = $10, so redemption value is $0.005 per point (1 pt = 0.005 AUD).
 * - Everyday Rewards: 2000 pts = $10 at checkout, same rate.
 * - Earn rate: Coles/Woolies both give 1 pt per $1 spent on groceries by default.
 */
export interface LoyaltyProgramDef {
  code: string;
  name: string;
  retailerCodes: string[];
  /** Dollars of redemption value per point. */
  dollarsPerPoint: number;
  /** Points earned per dollar spent. */
  earnRatePerDollar: number;
  /** Annual membership fee, if any. */
  annualFee: number;
}

export const LOYALTY_PROGRAMS: Record<string, LoyaltyProgramDef> = {
  flybuys: {
    code: 'flybuys',
    name: 'Flybuys',
    retailerCodes: ['coles'],
    dollarsPerPoint: 0.005,
    earnRatePerDollar: 1,
    annualFee: 0,
  },
  everyday_rewards: {
    code: 'everyday_rewards',
    name: 'Everyday Rewards',
    retailerCodes: ['woolworths'],
    dollarsPerPoint: 0.005,
    earnRatePerDollar: 1,
    annualFee: 0,
  },
  costco_membership: {
    code: 'costco_membership',
    name: 'Costco Membership',
    retailerCodes: ['costco'],
    dollarsPerPoint: 0,
    earnRatePerDollar: 0,
    annualFee: 65,
  },
  iga_rewards: {
    code: 'iga_rewards',
    name: 'IGA Rewards',
    retailerCodes: ['iga'],
    // Roughly $10 for every $500 spent across various regional IGA programs.
    dollarsPerPoint: 0.02,
    earnRatePerDollar: 1,
    annualFee: 0,
  },
};

export function programsForRetailer(retailerCode: string): LoyaltyProgramDef[] {
  return Object.values(LOYALTY_PROGRAMS).filter((p) => p.retailerCodes.includes(retailerCode));
}
