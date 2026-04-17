'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart, Truck, MapPin, Award, AlertTriangle, Star, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useShop } from '@/lib/shop-context';
import { buildOffers, CATALOGUE_PRODUCTS } from '@/lib/catalogue';
import { formatAUD } from '@/lib/utils';
import { optimiseBasket } from '@smartshopper/core/basket';
import { recommendFulfilment } from '@smartshopper/core/delivery';
import { DEFAULT_DELIVERY_POLICIES } from '@smartshopper/core/delivery';
import type { OptimiserPlan } from '@smartshopper/core/basket';
import type { Quote } from '@smartshopper/core/delivery';
import { StoreMap } from '@/components/shop/store-map';

const RETAILER_COLORS: Record<string, string> = {
  coles: 'bg-red-50 text-red-600',
  woolworths: 'bg-green-50 text-green-600',
  aldi: 'bg-blue-50 text-blue-600',
  iga: 'bg-orange-50 text-orange-600',
};

const RETAILER_NAMES: Record<string, string> = {
  coles: 'Coles',
  woolworths: 'Woolworths',
  aldi: 'ALDI',
  iga: 'IGA',
};

const RETAILER_HOURS: Record<string, string> = {
  coles: 'Typically 6am–10pm',
  woolworths: 'Typically 6am–10pm (Sun 8am–9pm)',
  aldi: 'Typically 8:30am–7pm (Sun 11am–5pm)',
  iga: 'Typically 7am–9pm',
};

export default function ResultsPage() {
  const { items, origin, preferences, postcode, suburb, hydrated } = useShop();
  const router = useRouter();

  const results = useMemo(() => {
    if (!origin || items.length === 0) return null;

    const baseOffers = buildOffers(origin, postcode);

    // Build the items + offers lists together so that generic items
    // ("Any haloumi") expand to offers for every matching branded product.
    // Each generic list item gets a synthetic productId; the offer list
    // maps that productId to every retailer+brand that satisfies it, so
    // the optimizer picks the cheapest.
    const resolvedItems: { listItemId: string; productId: string; productName: string; quantity: number }[] = [];
    const extraOffers: typeof baseOffers = [];

    for (const i of items) {
      if (i.genericType) {
        // Collect every product with this genericType.
        const matchingProducts = CATALOGUE_PRODUCTS.filter((p) => p.genericType === i.genericType);
        if (matchingProducts.length === 0) continue;
        const matchingIds = new Set(matchingProducts.map((p) => p.id));

        // Synthetic productId for this list item.
        const syntheticId = `generic:${i.id}`;
        resolvedItems.push({
          listItemId: i.id,
          productId: syntheticId,
          productName: i.productName ?? `Any ${i.genericType}`,
          quantity: i.quantity,
        });

        // Copy every real offer for a matching branded product, but
        // relabel its productId to the synthetic one so the optimizer
        // treats them as interchangeable for this list item.
        for (const offer of baseOffers) {
          if (matchingIds.has(offer.productId)) {
            extraOffers.push({ ...offer, productId: syntheticId });
          }
        }
      } else if (i.productId) {
        resolvedItems.push({
          listItemId: i.id,
          productId: i.productId,
          productName: i.productName ?? i.query,
          quantity: i.quantity,
        });
      }
    }

    if (resolvedItems.length === 0) return null;

    const offers = [...baseOffers, ...extraOffers];

    const plans = optimiseBasket({
      items: resolvedItems,
      offers,
      preferences: {
        origin,
        maxStores: preferences.maxStores,
        maxTravelKm: preferences.maxTravelKm,
        fuelCostPerKm: preferences.fuelCostPerKm,
        timeValuePerHour: preferences.timeValuePerHour,
        allowedRetailers: ['coles', 'woolworths', 'aldi', 'iga'],
        loyaltyMemberships: preferences.loyaltyMemberships,
        activeSubscriptions: preferences.activeSubscriptions,
        noCarAvailable: preferences.noCarAvailable,
      },
    });

    // Get fulfilment quotes for each retailer in the best plan
    const fulfilmentByRetailer = new Map<string, Quote[]>();
    if (plans.length > 0) {
      const bestPlan = plans[0]!;
      for (const retailerCode of bestPlan.retailerCodes) {
        const policy = DEFAULT_DELIVERY_POLICIES[retailerCode];
        if (!policy) continue;

        const retailerSubtotal = bestPlan.lines
          .filter((l) => l.retailerCode === retailerCode)
          .reduce((sum, l) => sum + l.lineTotal, 0);

        const retailerOffers = offers.filter((o) => o.retailerCode === retailerCode);
        const storeOffer = retailerOffers.find((o) => o.storeLocation);

        const quotes = recommendFulfilment({
          retailerCode,
          storeId: storeOffer?.storeId ?? undefined,
          storeLocation: storeOffer?.storeLocation ?? undefined,
          origin,
          basketSubtotal: retailerSubtotal,
          policy,
          fuelCostPerKm: preferences.fuelCostPerKm,
          timeValuePerHour: preferences.timeValuePerHour,
          loyaltyMemberships: preferences.loyaltyMemberships,
          activeSubscriptions: preferences.activeSubscriptions,
        });

        fulfilmentByRetailer.set(retailerCode, quotes);
      }
    }

    return { plans, fulfilmentByRetailer };
  }, [items, origin, preferences, postcode]);

  if (!hydrated) return null;

  if (!origin) {
    router.push('/shop');
    return null;
  }

  if (!results || results.plans.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-500">No results</h2>
        <p className="text-sm text-gray-400 mt-1">Add items to your list first</p>
        <button
          onClick={() => router.push('/shop/list')}
          className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Back to List
        </button>
      </div>
    );
  }

  const { plans, fulfilmentByRetailer } = results;
  const unresolvedItems = items.filter((i) => !i.productId && !i.genericType);
  const bestPlan = plans[0]!;
  const bestSinglePlan = plans.find((p) => p.kind === 'single_retailer');
  const multiPlan = plans.find((p) => p.kind === 'multi_retailer');
  const WORTH_SPLIT_THRESHOLD = 3.0; // dollars

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Best Deals</h1>
          <p className="text-sm text-gray-500 mt-1">
            <MapPin className="h-3 w-3 inline mr-1" />
            {suburb} ({postcode}) · {items.filter((i) => i.productId || i.genericType).length} items compared
          </p>
        </div>
        <button
          onClick={() => router.push('/shop/list')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Edit List
        </button>
      </div>

      {unresolvedItems.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-700">
            <strong>{unresolvedItems.length} item(s)</strong> couldn&apos;t be matched:{' '}
            {unresolvedItems.map((i) => i.query).join(', ')}
          </div>
        </div>
      )}

      {/* Savings breakdown — show the math for bigger lists */}
      {bestSinglePlan && multiPlan && bestPlan.lines.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-4 bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-gray-900">Savings breakdown</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-white rounded-lg border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Stay at one store</div>
              <div className="text-xl font-bold text-gray-900">
                {formatAUD(bestSinglePlan.grandTotal)}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {RETAILER_NAMES[bestSinglePlan.retailerCodes[0]!] ?? bestSinglePlan.retailerCodes[0]}
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${
              (multiPlan.savingsVsBestSingle ?? 0) >= WORTH_SPLIT_THRESHOLD
                ? 'bg-emerald-50 border-emerald-300'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-xs text-gray-500 mb-1">Split across {multiPlan.retailerCodes.length} stores</div>
              <div className="text-xl font-bold text-gray-900">
                {formatAUD(multiPlan.grandTotal)}
              </div>
              <div className="text-xs mt-0.5">
                {(multiPlan.savingsVsBestSingle ?? 0) >= WORTH_SPLIT_THRESHOLD ? (
                  <span className="text-emerald-700 font-medium">
                    Saves {formatAUD(multiPlan.savingsVsBestSingle!)} — worth it
                  </span>
                ) : (multiPlan.savingsVsBestSingle ?? 0) > 0 ? (
                  <span className="text-gray-500">
                    Only saves {formatAUD(multiPlan.savingsVsBestSingle!)} — probably not worth the extra trip
                  </span>
                ) : (
                  <span className="text-gray-400">
                    Costs more once travel is added
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Plan cards */}
      {plans.map((plan, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
        <PlanCard
          key={idx}
          plan={plan}
          rank={idx}
          fulfilment={fulfilmentByRetailer}
          worstTotal={plans[plans.length - 1]?.grandTotal ?? plan.grandTotal}
        />
        </motion.div>
      ))}

      {/* Real store map from OpenStreetMap */}
      {origin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: plans.length * 0.1 + 0.2 }}
        >
          <StoreMap
            lat={origin.lat}
            lng={origin.lng}
            highlightRetailers={plans[0]?.retailerCodes}
          />
        </motion.div>
      )}
    </div>
  );
}

function PlanCard({
  plan,
  rank,
  fulfilment,
  worstTotal,
}: {
  plan: OptimiserPlan;
  rank: number;
  fulfilment: Map<string, Quote[]>;
  worstTotal: number;
}) {
  const isBest = rank === 0;
  const savings = worstTotal - plan.grandTotal;

  return (
    <div
      className={`bg-white rounded-xl border overflow-hidden ${
        isBest ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-gray-200'
      }`}
    >
      {/* Header */}
      <div className={`px-5 py-4 flex items-center justify-between ${isBest ? 'bg-emerald-50' : 'bg-gray-50'}`}>
        <div className="flex items-center gap-3">
          {isBest && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
              <Award className="h-3 w-3" />
              Best Option
            </span>
          )}
          <span className="text-xs text-gray-500 capitalize">{plan.kind.replace(/_/g, ' ')}</span>
          <div className="flex gap-1">
            {plan.retailerCodes.map((code) => (
              <span key={code} className={`px-2 py-0.5 rounded-full text-xs font-medium ${RETAILER_COLORS[code] ?? 'bg-gray-100 text-gray-600'}`}>
                {RETAILER_NAMES[code] ?? code}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-gray-900">{formatAUD(plan.grandTotal)}</div>
          {savings > 0.5 && (
            <div className="text-xs text-emerald-600 font-medium">Save {formatAUD(savings)}</div>
          )}
        </div>
      </div>

      {/* Retailer hours */}
      <div className="px-5 py-3 border-b border-gray-100 space-y-1.5">
        {plan.retailerCodes.map((code) => {
          const hours = RETAILER_HOURS[code];
          return (
            <div key={code} className="flex items-center gap-2 text-xs">
              <span className={`px-1.5 py-0.5 rounded font-medium shrink-0 ${RETAILER_COLORS[code] ?? 'bg-gray-100 text-gray-600'}`}>
                {RETAILER_NAMES[code] ?? code}
              </span>
              {hours && (
                <span className="flex items-center gap-1 text-gray-400">
                  <Clock className="h-3 w-3 shrink-0" />
                  {hours}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Line items */}
      <div className="divide-y divide-gray-100">
        {plan.lines.map((line) => {
          const alt = plan.lineAlternatives?.find((a) => a.listItemId === line.listItemId);
          return (
            <div key={line.listItemId} className="px-5 py-2.5 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-gray-900 truncate">{line.productName}</span>
                  {line.quantity > 1 && <span className="text-gray-400 text-xs">×{line.quantity}</span>}
                  {line.isTrueSpecial && (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-xs rounded-full shrink-0">
                      <Star className="h-2.5 w-2.5" />
                      Deal
                    </span>
                  )}
                  {line.memberOnly && (
                    <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full shrink-0">
                      Members
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className={`px-1.5 py-0.5 rounded text-xs ${RETAILER_COLORS[line.retailerCode] ?? 'bg-gray-100 text-gray-600'}`}>
                    {RETAILER_NAMES[line.retailerCode] ?? line.retailerCode}
                  </span>
                  <span className="font-mono text-gray-700 w-16 text-right">{formatAUD(line.lineTotal)}</span>
                </div>
              </div>
              {alt && (
                <div className="mt-1 ml-0.5 text-[11px] text-amber-600 flex items-center gap-1">
                  <span>↓</span>
                  <span>
                    {formatAUD(alt.savingsPerUnit)} cheaper at {RETAILER_NAMES[alt.cheaperRetailerCode] ?? alt.cheaperRetailerCode}
                    {' '}({formatAUD(alt.cheaperPrice)})
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cost breakdown */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 space-y-1 text-sm">
        <div className="flex justify-between text-gray-500">
          <span>Subtotal</span>
          <span>{formatAUD(plan.subtotal)}</span>
        </div>
        {plan.totalFees > 0 && (
          <div className="flex justify-between text-gray-500">
            <span>Delivery / fees</span>
            <span>+{formatAUD(plan.totalFees)}</span>
          </div>
        )}
        {plan.totalTravelCost > 0 && (
          <div className="flex justify-between text-gray-500">
            <span>Travel cost (fuel)</span>
            <span>+{formatAUD(plan.totalTravelCost)}</span>
          </div>
        )}
        {plan.totalLoyaltyRebate > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Loyalty rebate</span>
            <span>−{formatAUD(plan.totalLoyaltyRebate)}</span>
          </div>
        )}
      </div>

      {/* Fulfilment options for best plan */}
      {rank === 0 && plan.retailerCodes.some((c) => fulfilment.has(c)) && (
        <div className="px-5 py-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Delivery vs Pickup
          </h3>
          <div className="space-y-3">
            {plan.retailerCodes.map((code) => {
              const quotes = fulfilment.get(code);
              if (!quotes?.length) return null;
              return (
                <div key={code}>
                  <div className="text-xs font-medium text-gray-500 mb-1">{RETAILER_NAMES[code] ?? code}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {quotes.filter((q) => q.eligible).slice(0, 3).map((q, i) => (
                      <div
                        key={q.mode}
                        className={`p-3 rounded-lg border text-sm ${
                          i === 0 ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-gray-900 capitalize text-xs">
                            {q.mode.replace(/_/g, ' ')}
                          </span>
                          <span className="font-mono font-semibold text-gray-900 text-xs">
                            {formatAUD(q.totalCost)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {q.fee > 0 && <span>Fee: {formatAUD(q.fee)} · </span>}
                          {q.distanceKm > 0 && <span>{q.distanceKm.toFixed(1)}km · </span>}
                          {q.roundTripMinutes > 0 && (
                            <span>
                              {Math.round(q.roundTripMinutes)}min {q.travelCost === 0 && q.distanceKm > 0 ? 'walk' : q.distanceKm > 0 ? 'drive' : ''}
                            </span>
                          )}
                          {q.travelCost === 0 && q.distanceKm > 0 && q.distanceKm <= 2 && (
                            <span> · No fuel cost</span>
                          )}
                        </div>
                        {q.explanation && (
                          <div className="text-xs text-gray-500 mt-1">{q.explanation}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {plan.explanation && (
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
          {plan.explanation}
        </div>
      )}
    </div>
  );
}
