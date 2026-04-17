import { LOYALTY_PROGRAMS } from './catalogue.js';

/**
 * Compute the AUD-equivalent rebate a user earns from a transaction at a retailer,
 * given which loyalty programs they hold. Returns 0 if the user holds no
 * applicable program.
 */
export function loyaltyRebateFor(
  retailerCode: string,
  subtotal: number,
  userMemberships: readonly string[],
): { rebate: number; programCode: string | null } {
  if (subtotal <= 0) return { rebate: 0, programCode: null };
  const memberships = new Set(userMemberships);
  let best = { rebate: 0, programCode: null as string | null };
  for (const program of Object.values(LOYALTY_PROGRAMS)) {
    if (!program.retailerCodes.includes(retailerCode)) continue;
    if (!memberships.has(program.code)) continue;
    const pts = subtotal * program.earnRatePerDollar;
    const dollars = pts * program.dollarsPerPoint;
    if (dollars > best.rebate) best = { rebate: dollars, programCode: program.code };
  }
  return best;
}

/**
 * When a promotion is labelled "member only" (e.g. Flybuys/Everyday Rewards price),
 * return whether the user actually qualifies.
 */
export function memberPriceApplies(
  retailerCode: string,
  userMemberships: readonly string[],
): boolean {
  const set = new Set(userMemberships);
  return Object.values(LOYALTY_PROGRAMS).some(
    (p) => p.retailerCodes.includes(retailerCode) && set.has(p.code),
  );
}
