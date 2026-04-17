import { estimateDrivingMinutes, haversineKm } from '../geo.js';
import type { LatLng } from '../geo.js';
import { loyaltyRebateFor } from '../loyalty/savings.js';
import type { DeliveryPolicy } from './policies.js';

export type FulfilmentMode = 'delivery' | 'click_and_collect' | 'direct_to_boot' | 'in_store_pickup';

export interface QuoteInput {
  retailerCode: string;
  storeId?: string;
  storeLocation?: LatLng;
  /** Home location of the user. */
  origin: LatLng;
  /** Post-promotion basket subtotal at this retailer. */
  basketSubtotal: number;
  /** Retailer policy to apply. */
  policy: DeliveryPolicy;
  /** Local time we'd like the delivery/collection, used to pick the tier. */
  scheduledAt?: Date;
  /** Fuel + wear-and-tear cost per km, AUD. */
  fuelCostPerKm: number;
  /** Hourly value of the user's time, AUD. */
  timeValuePerHour: number;
  /** Active subscription codes the user has for this retailer. */
  activeSubscriptions?: readonly string[];
  /** Loyalty program memberships the user holds. */
  loyaltyMemberships?: readonly string[];
  /** Minutes typically spent inside a store once the user arrives (in-store pickup only). */
  defaultInStoreMinutes?: number;
}

export interface Quote {
  retailerCode: string;
  storeId: string | null;
  mode: FulfilmentMode;
  basketSubtotal: number;
  fee: number;
  distanceKm: number;
  roundTripMinutes: number;
  inStoreMinutes: number;
  travelCost: number;
  timeCost: number;
  loyaltyRebate: number;
  loyaltyProgramCode: string | null;
  totalCost: number;
  explanation: string;
  eligible: boolean;
  ineligibleReason: string | null;
}

const HH_MM_RE = /^(\d{2}):(\d{2})$/;

function inWindow(scheduled: Date, start: string, end: string, weekdays: readonly number[]): boolean {
  const weekday = scheduled.getDay();
  if (!weekdays.includes(weekday)) return false;
  const mins = scheduled.getHours() * 60 + scheduled.getMinutes();
  const [_s, sh, sm] = HH_MM_RE.exec(start) ?? [];
  const [_e, eh, em] = HH_MM_RE.exec(end) ?? [];
  if (!sh || !sm || !eh || !em) return false;
  const startMins = Number(sh) * 60 + Number(sm);
  const endMins = Number(eh) * 60 + Number(em);
  return mins >= startMins && mins <= endMins;
}

function deliveryFee(policy: DeliveryPolicy, subtotal: number, scheduledAt: Date): number {
  if (policy.freeDeliveryThreshold !== null && subtotal >= policy.freeDeliveryThreshold) return 0;
  for (const tier of policy.tiers) {
    if (inWindow(scheduledAt, tier.windowStart, tier.windowEnd, tier.weekdays)) return tier.fee;
  }
  return policy.defaultDeliveryFee;
}

function subscriptionAdjustedFee(
  fee: number,
  policy: DeliveryPolicy,
  active: readonly string[],
): { fee: number; matched: string | null } {
  const activeSet = new Set(active);
  for (const sub of policy.subscriptions) {
    if (activeSet.has(sub.code) && sub.reducesFeeToZero) return { fee: 0, matched: sub.code };
  }
  return { fee, matched: null };
}

/** Produce a single fulfilment quote for a given mode. */
export function quoteFulfilment(input: QuoteInput, mode: FulfilmentMode): Quote {
  const scheduledAt = input.scheduledAt ?? new Date();
  const activeSubs = input.activeSubscriptions ?? [];
  const loyalty = input.loyaltyMemberships ?? [];
  const defaultInStoreMinutes = input.defaultInStoreMinutes ?? 25;

  const distanceKm =
    mode === 'delivery' || !input.storeLocation ? 0 : haversineKm(input.origin, input.storeLocation);
  const drivingMinutesOneWay = mode === 'delivery' ? 0 : estimateDrivingMinutes(distanceKm);
  const roundTripMinutes = drivingMinutesOneWay * 2;

  const inStoreMinutes =
    mode === 'in_store_pickup' ? defaultInStoreMinutes : mode === 'click_and_collect' ? 8 : mode === 'direct_to_boot' ? 3 : 0;

  const travelCost = mode === 'delivery' ? 0 : distanceKm * 2 * input.fuelCostPerKm;
  const timeCost = ((roundTripMinutes + inStoreMinutes) / 60) * input.timeValuePerHour;

  // Fee / eligibility per mode.
  let fee = 0;
  let eligible = true;
  let ineligibleReason: string | null = null;

  if (mode === 'delivery') {
    if (input.basketSubtotal < input.policy.minimumSpend) {
      eligible = false;
      ineligibleReason = `Basket of $${input.basketSubtotal.toFixed(2)} is below the $${input.policy.minimumSpend.toFixed(
        2,
      )} minimum for delivery.`;
    }
    const raw = deliveryFee(input.policy, input.basketSubtotal, scheduledAt);
    fee = subscriptionAdjustedFee(raw, input.policy, activeSubs).fee;
  } else if (mode === 'click_and_collect' || mode === 'direct_to_boot') {
    if (input.basketSubtotal < input.policy.clickAndCollectMinimum) {
      eligible = false;
      ineligibleReason = `Basket of $${input.basketSubtotal.toFixed(2)} is below the $${input.policy.clickAndCollectMinimum.toFixed(
        2,
      )} minimum for click-and-collect.`;
    }
    fee = input.policy.clickAndCollectFee;
  } else if (mode === 'in_store_pickup') {
    fee = 0;
  }

  const { rebate, programCode } = loyaltyRebateFor(input.retailerCode, input.basketSubtotal, loyalty);

  const totalCost = input.basketSubtotal + fee + travelCost + timeCost - rebate;

  return {
    retailerCode: input.retailerCode,
    storeId: input.storeId ?? null,
    mode,
    basketSubtotal: input.basketSubtotal,
    fee,
    distanceKm,
    roundTripMinutes,
    inStoreMinutes,
    travelCost,
    timeCost,
    loyaltyRebate: rebate,
    loyaltyProgramCode: programCode,
    totalCost,
    explanation: buildExplanation({
      mode,
      fee,
      distanceKm,
      travelCost,
      timeCost,
      rebate,
      subtotal: input.basketSubtotal,
      freeThreshold: input.policy.freeDeliveryThreshold,
      eligible,
      ineligibleReason,
    }),
    eligible,
    ineligibleReason,
  };
}

function buildExplanation(opts: {
  mode: FulfilmentMode;
  fee: number;
  distanceKm: number;
  travelCost: number;
  timeCost: number;
  rebate: number;
  subtotal: number;
  freeThreshold: number | null;
  eligible: boolean;
  ineligibleReason: string | null;
}): string {
  if (!opts.eligible) return opts.ineligibleReason ?? 'Not eligible.';
  const parts: string[] = [];
  if (opts.mode === 'delivery') {
    if (opts.fee === 0 && opts.freeThreshold !== null && opts.subtotal >= opts.freeThreshold) {
      parts.push(
        `Delivery is free because your basket clears the $${opts.freeThreshold.toFixed(
          0,
        )} free-delivery threshold.`,
      );
    } else if (opts.fee === 0) {
      parts.push('Delivery is free with your active subscription.');
    } else {
      parts.push(`Delivery fee is $${opts.fee.toFixed(2)}.`);
    }
  } else {
    parts.push(
      `${opts.mode.replace(/_/g, ' ')} — ${opts.distanceKm.toFixed(
        1,
      )} km drive, $${opts.travelCost.toFixed(2)} fuel and $${opts.timeCost.toFixed(2)} of your time.`,
    );
  }
  if (opts.rebate > 0) parts.push(`Loyalty rebate: $${opts.rebate.toFixed(2)}.`);
  return parts.join(' ');
}
