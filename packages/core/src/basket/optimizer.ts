import { DEFAULT_DELIVERY_POLICIES } from '../delivery/policies.js';
import { recommendFulfilment } from '../delivery/recommend.js';
import type { Quote } from '../delivery/quote.js';
import { haversineKm, ROAD_DISTANCE_FACTOR } from '../geo.js';
import { loyaltyRebateFor } from '../loyalty/savings.js';
import { planRoute } from './route.js';
import type {
  OptimiserItem,
  OptimiserOffer,
  OptimiserPlan,
  OptimiserPreferences,
  OptimiserLine,
  OptimiserLineAlternative,
  OptimiserRoute,
  OptimiserRouteLeg,
} from './types.js';

interface OptimiseInput {
  items: readonly OptimiserItem[];
  offers: readonly OptimiserOffer[];
  preferences: OptimiserPreferences;
}

/** Minutes spent inside a store at a route stop — matches the in-store
 *  pickup default used by the delivery quoter. */
const IN_STORE_MINUTES = 25;

/**
 * Produce a ranked set of purchase plans:
 *   - one `single_retailer` plan per retailer,
 *   - a `multi_retailer` plan if the user can drive a route between stores,
 *   - a `delivery_only` plan if the user has no car (noCarAvailable).
 *
 * Ranking key: `grandTotal` — the all-in money cost (basket + fees + the
 * petrol estimate for the trip − loyalty rebate). Lowest total wins.
 * Full-coverage plans always rank above partial ones. Trip time and the
 * route are shown for information but never reorder the plans.
 *
 * The greedy multi-retailer heuristic is sufficient for typical grocery
 * lists (< 100 items) and runs in O(items × retailers); the multi-store
 * leg distances come from an exact travelling-salesman loop (see route.ts).
 */
export function optimiseBasket({ items, offers, preferences }: OptimiseInput): OptimiserPlan[] {
  if (items.length === 0) return [];

  const offersForAllowedRetailer = offers.filter(
    (o) =>
      (preferences.allowedRetailers.length === 0 ||
        preferences.allowedRetailers.includes(o.retailerCode)) &&
      o.inStock &&
      (!o.storeLocation ||
        haversineKm(preferences.origin, o.storeLocation) <= preferences.maxTravelKm),
  );

  const plans: OptimiserPlan[] = [];
  const retailerCodes = [...new Set(offersForAllowedRetailer.map((o) => o.retailerCode))];

  // (1) Single-retailer plans — one per retailer that covers at least one item.
  for (const retailerCode of retailerCodes) {
    const plan = buildSingleRetailerPlan(retailerCode, items, offersForAllowedRetailer, preferences);
    if (plan) plans.push(plan);
  }

  // (2) Multi-retailer plan: one driving route between stores. Pointless
  //     for a user with no car — they get the delivery-only plan instead.
  if (preferences.maxStores > 1 && retailerCodes.length > 1 && !preferences.noCarAvailable) {
    const multi = buildMultiRetailerPlan(items, offersForAllowedRetailer, preferences);
    if (multi) plans.push(multi);
  }

  // (3) Delivery-only plan when the user can't drive.
  if (preferences.noCarAvailable) {
    const deliveryOnly = buildDeliveryOnlyPlan(items, offersForAllowedRetailer, preferences);
    if (deliveryOnly) plans.push(deliveryOnly);
  }

  // Drop partial plans once any plan covers the whole basket — an
  // incomplete basket (a retailer that doesn't stock eggs) isn't a real
  // answer to "how do I buy all of this". Keep partials only as a
  // best-effort fallback when nothing achieves full coverage.
  const rankable = plans.some((p) => p.coverage >= 1)
    ? plans.filter((p) => p.coverage >= 1)
    : plans;
  plans.length = 0;
  plans.push(...rankable);

  // Rank: full-coverage plans always beat partial ones — a cheaper plan
  // that can't fulfil the whole basket (e.g. a retailer that doesn't stock
  // eggs) must never be presented as "best". Within equal coverage the
  // lowest grand total wins (basket + fees + petrol − loyalty); a shorter
  // drive only breaks an exact money tie.
  plans.sort((a, b) => {
    // coverage is fulfilled/total in [0,1]; round to avoid float noise.
    const covA = Math.round(a.coverage * 1000);
    const covB = Math.round(b.coverage * 1000);
    if (covA !== covB) return covB - covA; // higher coverage first

    const money = a.grandTotal - b.grandTotal;
    if (Math.abs(money) > 0.01) return money;
    return a.route.totalKm - b.route.totalKm;
  });

  // Annotate each plan with savings-vs-best-single-retailer + per-line
  // "cheaper elsewhere" hints so the UI can show the math. Compare only
  // against the best *fully covering* single-retailer plan so the savings
  // math isn't skewed by an incomplete basket.
  const bestSingle = plans.find((p) => p.kind === 'single_retailer' && p.coverage >= 1);
  for (const plan of plans) {
    plan.savingsVsBestSingle =
      bestSingle && plan !== bestSingle ? bestSingle.grandTotal - plan.grandTotal : null;
    plan.lineAlternatives = computeLineAlternatives(plan.lines, offersForAllowedRetailer);
  }

  return plans;
}

/**
 * For each line in a plan, find the single cheapest offer for the same
 * productId across all retailers. If it's cheaper than the line's current
 * unit price, flag it. Surfaces "this could be $X cheaper at Y" tips.
 */
function computeLineAlternatives(
  lines: readonly OptimiserLine[],
  offers: readonly OptimiserOffer[],
): OptimiserLineAlternative[] {
  const alternatives: OptimiserLineAlternative[] = [];
  for (const line of lines) {
    let cheapest: OptimiserOffer | null = null;
    for (const offer of offers) {
      if (offer.productId !== line.productId) continue;
      if (offer.retailerCode === line.retailerCode) continue;
      if (!cheapest || offer.price < cheapest.price) cheapest = offer;
    }
    if (cheapest && cheapest.price < line.unitPrice - 0.01) {
      alternatives.push({
        listItemId: line.listItemId,
        cheaperRetailerCode: cheapest.retailerCode,
        cheaperPrice: cheapest.price,
        savingsPerUnit: Math.round((line.unitPrice - cheapest.price) * 100) / 100,
      });
    }
  }
  return alternatives;
}

// ──────────────────────────────────────────────────────────────────────────────
// Plan builders
// ──────────────────────────────────────────────────────────────────────────────

function buildSingleRetailerPlan(
  retailerCode: string,
  items: readonly OptimiserItem[],
  offers: readonly OptimiserOffer[],
  prefs: OptimiserPreferences,
): OptimiserPlan | null {
  const byRetailer = offers.filter((o) => o.retailerCode === retailerCode);
  if (byRetailer.length === 0) return null;

  const { lines, missing } = chooseCheapestLinesForItems(items, byRetailer);
  if (lines.length === 0) return null;

  const subtotal = sumLineTotals(lines);
  const bestStoreOffer = pickClosestStore(byRetailer, prefs);
  const quote = quoteForRetailer(retailerCode, subtotal, bestStoreOffer, prefs);

  // Route: a single stop when the chosen fulfilment is a physical visit;
  // empty when it's delivered (there's nothing to drive to).
  const isVisit =
    quote.mode !== 'delivery' && quote.distanceKm > 0 && bestStoreOffer?.storeLocation != null;
  const route: OptimiserRoute = isVisit
    ? {
        legs: [
          {
            retailerCode,
            storeId: quote.storeId,
            storeLocation: bestStoreOffer!.storeLocation!,
            fromPreviousKm: roundKm(quote.distanceKm * ROAD_DISTANCE_FACTOR),
          },
        ],
        totalKm: roundKm(quote.distanceKm * ROAD_DISTANCE_FACTOR * 2),
        travelMinutes: quote.roundTripMinutes,
      }
    : emptyRoute();

  const tripMinutes = quote.roundTripMinutes + quote.inStoreMinutes;
  const grandTotal = subtotal + quote.fee + quote.travelCost - quote.loyaltyRebate;

  return {
    kind: 'single_retailer',
    lines,
    retailerCodes: [retailerCode],
    subtotal,
    totalFees: quote.fee,
    totalTravelCost: quote.travelCost,
    totalTimeCost: quote.timeCost,
    totalLoyaltyRebate: quote.loyaltyRebate,
    grandTotal,
    coverage: lines.length / items.length,
    missingItemIds: missing,
    explanation: buildSingleRetailerExplanation(retailerCode, lines.length, items.length, quote),
    route,
    tripMinutes,
  };
}

function buildMultiRetailerPlan(
  items: readonly OptimiserItem[],
  offers: readonly OptimiserOffer[],
  prefs: OptimiserPreferences,
): OptimiserPlan | null {
  // For every item, find its single cheapest offer (ignoring stores budget).
  const initialChoices = new Map<string, OptimiserOffer>();
  for (const item of items) {
    const itemOffers = offers.filter((o) => o.productId === item.productId);
    if (itemOffers.length === 0) continue;
    const cheapest = itemOffers.reduce((a, b) => (a.price <= b.price ? a : b));
    initialChoices.set(item.listItemId, cheapest);
  }
  if (initialChoices.size === 0) return null;

  // If the cheapest choices already fit within the store budget, we're done.
  const retailersUsed = new Set([...initialChoices.values()].map((o) => o.retailerCode));

  // If too many retailers, iteratively fold items out of the most expensive retailer
  // into the next-cheapest retailer already in use.
  while (retailersUsed.size > prefs.maxStores) {
    const droppable = pickDroppableRetailer(retailersUsed, initialChoices);
    if (!droppable) break;
    const kept = new Set(retailersUsed);
    kept.delete(droppable);
    // Reassign every item that was bought from the dropped retailer to its cheapest option among `kept`.
    for (const [listItemId, offer] of initialChoices) {
      if (offer.retailerCode !== droppable) continue;
      const alt = offers
        .filter((o) => o.productId === offer.productId && kept.has(o.retailerCode))
        .sort((a, b) => a.price - b.price)[0];
      if (!alt) {
        // We can't source this item from the kept retailers: drop the line to preserve budget.
        initialChoices.delete(listItemId);
      } else {
        initialChoices.set(listItemId, alt);
      }
    }
    retailersUsed.clear();
    for (const o of initialChoices.values()) retailersUsed.add(o.retailerCode);
  }

  if (retailersUsed.size < 2) return null; // degenerates to a single-retailer plan

  const lines: OptimiserLine[] = items
    .filter((i) => initialChoices.has(i.listItemId))
    .map((item) => {
      const offer = initialChoices.get(item.listItemId)!;
      return {
        listItemId: item.listItemId,
        productId: item.productId,
        productName: offer.productName,
        retailerCode: offer.retailerCode,
        retailerProductId: offer.retailerProductId,
        quantity: item.quantity,
        unitPrice: offer.price,
        lineTotal: offer.price * item.quantity,
        isTrueSpecial: offer.isTrueSpecial,
        memberOnly: offer.memberOnly,
      };
    });

  const subtotalByRetailer = groupSum(lines, (l) => l.retailerCode, (l) => l.lineTotal);

  // Closest store for each retailer that has one within reach.
  const storeByRetailer = new Map<string, OptimiserOffer>();
  for (const retailerCode of retailersUsed) {
    const closest = pickClosestStore(
      offers.filter((o) => o.retailerCode === retailerCode),
      prefs,
    );
    if (closest?.storeLocation) storeByRetailer.set(retailerCode, closest);
  }

  // The drive: one optimal travelling-salesman loop through every store on
  // the plan, billed once — NOT as an independent round trip per retailer,
  // which is what the old quoting did and badly over-counted.
  const drivable = [...retailersUsed].filter((r) => storeByRetailer.has(r));
  const planned = planRoute(
    prefs.origin,
    drivable.map((r) => storeByRetailer.get(r)!.storeLocation!),
  );
  const routeLegs: OptimiserRouteLeg[] = planned.order.map((stop) => {
    const retailerCode = drivable[stop.index]!;
    const store = storeByRetailer.get(retailerCode)!;
    return {
      retailerCode,
      storeId: store.storeId,
      storeLocation: store.storeLocation!,
      fromPreviousKm: stop.fromPreviousKm,
    };
  });

  // Fees + loyalty: a route stop is an in-store pickup (no fee); a retailer
  // with no reachable store falls back to a delivery quote.
  let totalFees = 0;
  let totalLoyaltyRebate = 0;
  let deliveredTravelCost = 0;
  for (const retailerCode of retailersUsed) {
    const retailerSubtotal = subtotalByRetailer.get(retailerCode) ?? 0;
    if (storeByRetailer.has(retailerCode)) {
      totalLoyaltyRebate += loyaltyRebateFor(
        retailerCode,
        retailerSubtotal,
        prefs.loyaltyMemberships,
      ).rebate;
    } else {
      const quote = quoteForRetailer(retailerCode, retailerSubtotal, null, prefs);
      totalFees += quote.fee;
      totalLoyaltyRebate += quote.loyaltyRebate;
      deliveredTravelCost += quote.travelCost;
    }
  }

  const subtotal = sumLineTotals(lines);
  const totalTravelCost = planned.totalKm * prefs.fuelCostPerKm + deliveredTravelCost;
  const tripMinutes = planned.drivingMinutes + drivable.length * IN_STORE_MINUTES;
  const grandTotal = subtotal + totalFees + totalTravelCost - totalLoyaltyRebate;

  return {
    kind: 'multi_retailer',
    lines,
    retailerCodes: [...retailersUsed],
    subtotal,
    totalFees,
    totalTravelCost,
    totalTimeCost: 0,
    totalLoyaltyRebate,
    grandTotal,
    coverage: lines.length / items.length,
    missingItemIds: items
      .filter((i) => !initialChoices.has(i.listItemId))
      .map((i) => i.listItemId),
    explanation:
      drivable.length > 0
        ? `Splits your basket across ${retailersUsed.size} retailers — one ${planned.totalKm.toFixed(
            1,
          )} km loop visiting each, cheapest items picked at every stop, within your ${prefs.maxStores}-store limit.`
        : `Splits your basket across ${retailersUsed.size} retailers, all delivered to your door.`,
    route: { legs: routeLegs, totalKm: planned.totalKm, travelMinutes: planned.drivingMinutes },
    tripMinutes,
  };
}

function buildDeliveryOnlyPlan(
  items: readonly OptimiserItem[],
  offers: readonly OptimiserOffer[],
  prefs: OptimiserPreferences,
): OptimiserPlan | null {
  const base = buildSingleRetailerPlan('woolworths', items, offers, prefs);
  if (!base) return null;
  // Delivery-only: nothing is driven, so there's no route and no trip time.
  return {
    ...base,
    kind: 'delivery_only',
    route: emptyRoute(),
    tripMinutes: 0,
    explanation: `Delivery-only plan — no car trips. ${base.explanation}`,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function emptyRoute(): OptimiserRoute {
  return { legs: [], totalKm: 0, travelMinutes: 0 };
}

function roundKm(km: number): number {
  return Math.round(km * 100) / 100;
}

function chooseCheapestLinesForItems(
  items: readonly OptimiserItem[],
  offers: readonly OptimiserOffer[],
): { lines: OptimiserLine[]; missing: string[] } {
  const lines: OptimiserLine[] = [];
  const missing: string[] = [];
  for (const item of items) {
    const candidates = offers.filter((o) => o.productId === item.productId);
    if (candidates.length === 0) {
      missing.push(item.listItemId);
      continue;
    }
    // Pick cheapest; break ties by distance (closer store wins)
    const cheapest = candidates.reduce((a, b) => {
      if (a.price < b.price) return a;
      if (b.price < a.price) return b;
      // Same price → prefer the closer store
      return a.distanceKm <= b.distanceKm ? a : b;
    });
    lines.push({
      listItemId: item.listItemId,
      productId: item.productId,
      productName: cheapest.productName,
      retailerCode: cheapest.retailerCode,
      retailerProductId: cheapest.retailerProductId,
      quantity: item.quantity,
      unitPrice: cheapest.price,
      lineTotal: cheapest.price * item.quantity,
      isTrueSpecial: cheapest.isTrueSpecial,
      memberOnly: cheapest.memberOnly,
    });
  }
  return { lines, missing };
}

function pickClosestStore(offers: readonly OptimiserOffer[], prefs: OptimiserPreferences) {
  const withStore = offers.filter((o) => o.storeLocation);
  if (withStore.length === 0) return null;
  return withStore.reduce((a, b) =>
    haversineKm(prefs.origin, a.storeLocation!) <= haversineKm(prefs.origin, b.storeLocation!)
      ? a
      : b,
  );
}

/**
 * Quote a retailer's fulfilment, picking the cheapest mode by money out
 * of pocket (fee + the petrol estimate). With `noCarAvailable` set, only
 * delivery is considered.
 */
function quoteForRetailer(
  retailerCode: string,
  subtotal: number,
  storeOffer: OptimiserOffer | null,
  prefs: OptimiserPreferences,
): Quote {
  const policy = DEFAULT_DELIVERY_POLICIES[retailerCode] ?? DEFAULT_DELIVERY_POLICIES.woolworths!;
  const quotes = recommendFulfilment({
    retailerCode,
    storeId: storeOffer?.storeId ?? undefined,
    storeLocation: storeOffer?.storeLocation ?? undefined,
    origin: prefs.origin,
    basketSubtotal: subtotal,
    policy,
    fuelCostPerKm: prefs.fuelCostPerKm,
    timeValuePerHour: prefs.timeValuePerHour,
    activeSubscriptions: prefs.activeSubscriptions,
    loyaltyMemberships: prefs.loyaltyMemberships,
  });
  let eligible = quotes.filter((q) => q.eligible);
  // No car → delivery is the only real option.
  if (prefs.noCarAvailable) eligible = eligible.filter((q) => q.mode === 'delivery');
  if (eligible.length > 0) {
    // Cheapest mode by money out of pocket — fee plus the petrol estimate.
    return eligible.reduce((best, q) => (q.totalCost < best.totalCost ? q : best));
  }
  // No eligible fulfilment; return a degenerate zero-fee "pickup" so totals stay defined.
  return {
    retailerCode,
    storeId: null,
    mode: 'in_store_pickup',
    basketSubtotal: subtotal,
    fee: 0,
    distanceKm: 0,
    roundTripMinutes: 0,
    inStoreMinutes: 0,
    travelCost: 0,
    timeCost: 0,
    loyaltyRebate: 0,
    loyaltyProgramCode: null,
    totalCost: subtotal,
    explanation: 'No eligible fulfilment mode — showing basket subtotal only.',
    eligible: false,
    ineligibleReason: 'No store within travel limit and delivery not available.',
  };
}

function pickDroppableRetailer(
  retailersUsed: Set<string>,
  choices: Map<string, OptimiserOffer>,
): string | null {
  // Choose the retailer contributing the least dollars — least painful to drop.
  const totals = new Map<string, number>();
  for (const offer of choices.values()) {
    totals.set(offer.retailerCode, (totals.get(offer.retailerCode) ?? 0) + offer.price);
  }
  let worst: { retailer: string; total: number } | null = null;
  for (const r of retailersUsed) {
    const t = totals.get(r) ?? 0;
    if (!worst || t < worst.total) worst = { retailer: r, total: t };
  }
  return worst?.retailer ?? null;
}

function sumLineTotals(lines: readonly OptimiserLine[]): number {
  return lines.reduce((s, l) => s + l.lineTotal, 0);
}

function groupSum<T>(
  items: readonly T[],
  keyOf: (t: T) => string,
  valueOf: (t: T) => number,
): Map<string, number> {
  const m = new Map<string, number>();
  for (const x of items) m.set(keyOf(x), (m.get(keyOf(x)) ?? 0) + valueOf(x));
  return m;
}

function buildSingleRetailerExplanation(
  retailerCode: string,
  linesCount: number,
  itemsCount: number,
  quote: Quote,
): string {
  const coverage =
    linesCount === itemsCount ? 'covers your full list' : `covers ${linesCount}/${itemsCount} items`;
  const { mode, fee } = quote;
  const feeBit = fee === 0 ? 'free' : `$${fee.toFixed(2)} fee`;
  return `${retailerCode}: ${coverage}, via ${mode.replace(/_/g, ' ')} (${feeBit}).`;
}
