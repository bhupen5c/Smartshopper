import { LOYALTY_PROGRAMS } from './catalogue.js';

/**
 * Loyalty rebate is only applied when the user has an actual voucher or
 * member-price discount — NOT as an automatic points-based percentage.
 *
 * In reality, Flybuys/Everyday Rewards points are earned passively and
 * redeemed manually. Auto-calculating a rebate of $0.04 on a $7 item
 * is misleading. Loyalty value comes from:
 *   1. Member-only prices (handled via `memberOnly` flag on offers)
 *   2. Specific vouchers/coupons (not yet implemented — needs real data)
 *
 * For now, this returns 0. When we have real voucher data from scrapers,
 * this function will check the user's active vouchers against items.
 */
export function loyaltyRebateFor(
  _retailerCode: string,
  _subtotal: number,
  _userMemberships: readonly string[],
): { rebate: number; programCode: string | null } {
  // No automatic rebate — loyalty value comes from member-only prices
  // and specific vouchers, not passive point accrual.
  return { rebate: 0, programCode: null };
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
