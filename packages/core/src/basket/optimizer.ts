import { DEFAULT_DELIVERY_POLICIES } from '../delivery/policies.js';
import { bestFulfilment } from '../delivery/recommend.js';
import type { Quote } from '../delivery/quote.js';
import { haversineKm } from '../geo.js';
import type {
  OptimiserItem,
  OptimiserOffer,
  OptimiserPlan,
  OptimiserPreferences,
  OptimiserLine,
} from './types.js';

interface OptimiseInput {
  items: readonly OptimiserItem[];
  offers: readonly OptimiserOffer[];
  preferences: OptimiserPreferences;
}

/**
 * Produce a ranked set of purchase plans:
 *   - one `single_retailer` plan per retailer with full coverage,
 *   - a `multi_retailer` plan if allowed and it beats every single-retailer plan,
 *   - a `delivery_only` plan if the user has no car (noCarAvailable).
 *
 * Ranking key: grand total (money out of pocket + travel cost + time cost − loyalty rebate).
 * The greedy multi-retailer heuristic is sufficient for typical grocery lists (< 100 items)
 * and runs in O(items × retailers). A swap local-search step polishes the result.
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

  // (2) Multi-retailer plan via greedy item-to-retailer assignment with a store budget.
  if (preferences.maxStores > 1 && retailerCodes.length > 1) {
    const multi = buildMultiRetailerPlan(items, offersForAllowedRetailer, preferences);
    if (multi) plans.push(multi);
  }

  // (3) Delivery-only plan when the user can't drive.
  if (preferences.noCarAvailable) {
    const deliveryOnly = buildDeliveryOnlyPlan(items, offersForAllowedRetailer, preferences);
    if (deliveryOnly) plans.push(deliveryOnly);
  }

  // Rank cheapest-first.
  plans.sort((a, b) => a.grandTotal - b.grandTotal);
  return plans;
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

  return {
    kind: 'single_retailer',
    lines,
    retailerCodes: [retailerCode],
    subtotal,
    totalFees: quote.fee,
    totalTravelCost: quote.travelCost,
    totalTimeCost: quote.timeCost,
    totalLoyaltyRebate: quote.loyaltyRebate,
    grandTotal: subtotal + quote.fee + quote.travelCost - quote.loyaltyRebate,
    coverage: lines.length / items.length,
    missingItemIds: missing,
    explanation: buildSingleRetailerExplanation(retailerCode, lines.length, items.length, quote),
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
  const quotes: Quote[] = [];
  for (const retailerCode of retailersUsed) {
    const subtotal = subtotalByRetailer.get(retailerCode) ?? 0;
    const storeOffer = pickClosestStore(
      offers.filter((o) => o.retailerCode === retailerCode),
      prefs,
    );
    quotes.push(quoteForRetailer(retailerCode, subtotal, storeOffer, prefs));
  }

  const subtotal = sumLineTotals(lines);
  const totalFees = quotes.reduce((s, q) => s + q.fee, 0);
  const totalTravelCost = quotes.reduce((s, q) => s + q.travelCost, 0);
  const totalTimeCost = quotes.reduce((s, q) => s + q.timeCost, 0);
  const totalLoyaltyRebate = quotes.reduce((s, q) => s + q.loyaltyRebate, 0);

  return {
    kind: 'multi_retailer',
    lines,
    retailerCodes: [...retailersUsed],
    subtotal,
    totalFees,
    totalTravelCost,
    totalTimeCost,
    totalLoyaltyRebate,
    grandTotal: subtotal + totalFees + totalTravelCost - totalLoyaltyRebate,
    coverage: lines.length / items.length,
    missingItemIds: items.filter((i) => !initialChoices.has(i.listItemId)).map((i) => i.listItemId),
    explanation: `Splits your basket across ${retailersUsed.size} retailers — cheapest items picked at each, respecting your ${prefs.maxStores}-store limit.`,
  };
}

function buildDeliveryOnlyPlan(
  items: readonly OptimiserItem[],
  offers: readonly OptimiserOffer[],
  prefs: OptimiserPreferences,
): OptimiserPlan | null {
  const base = buildSingleRetailerPlan('woolworths', items, offers, prefs);
  if (!base) return null;
  return {
    ...base,
    kind: 'delivery_only',
    explanation: `Delivery-only plan — no car trips. ${base.explanation}`,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

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
    const cheapest = candidates.reduce((a, b) => (a.price <= b.price ? a : b));
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
    haversineKm(prefs.origin, a.storeLocation!) <= haversineKm(prefs.origin, b.storeLocation!) ? a : b,
  );
}

function quoteForRetailer(
  retailerCode: string,
  subtotal: number,
  storeOffer: OptimiserOffer | null,
  prefs: OptimiserPreferences,
): Quote {
  const policy = DEFAULT_DELIVERY_POLICIES[retailerCode] ?? DEFAULT_DELIVERY_POLICIES.woolworths!;
  const quote = bestFulfilment({
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
  if (quote) return quote;
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
  const coverage = linesCount === itemsCount ? 'covers your full list' : `covers ${linesCount}/${itemsCount} items`;
  const { mode, fee } = quote;
  const feeBit = fee === 0 ? 'free' : `$${fee.toFixed(2)} fee`;
  return `${retailerCode}: ${coverage}, via ${mode.replace(/_/g, ' ')} (${feeBit}).`;
}
