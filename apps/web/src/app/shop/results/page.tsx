'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart, Truck, MapPin, Award, AlertTriangle, Star, Clock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useShop } from '@/lib/shop-context';
import { buildOffers, CATALOGUE_PRODUCTS, getNearestStores, getAllPricesFor } from '@/lib/catalogue';
import { formatAUD } from '@/lib/utils';
import { optimiseBasket } from '@smartshopper/core/basket';
import { recommendFulfilment } from '@smartshopper/core/delivery';
import { DEFAULT_DELIVERY_POLICIES } from '@smartshopper/core/delivery';
import type { OptimiserPlan } from '@smartshopper/core/basket';
import type { Quote } from '@smartshopper/core/delivery';
import { StoreMap } from '@/components/shop/store-map';
import { RETAILER_COLORS, RETAILER_NAMES, RETAILER_FALLBACK_HOURS, formatOpeningHours } from '@/lib/retailers';

export default function ResultsPage() {
  const { items, origin, preferences, postcode, suburb, hydrated, nearbyStores, storesLoading } = useShop();
  const router = useRouter();

  const results = useMemo(() => {
    if (!origin || items.length === 0) return null;

    const baseOffers = buildOffers(origin, nearbyStores);
    const assignedStores = getNearestStores();

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

    return { plans, fulfilmentByRetailer, assignedStores };
  }, [items, origin, preferences, nearbyStores]);

  if (!hydrated) return null;

  // Stores are being fetched from OSM — show a brief skeleton so the UI
  // doesn't flicker between "no offers" and "real offers".
  if (storesLoading && (!results || results.plans.length === 0)) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <Loader2 className="mx-auto mb-3 size-8 animate-spin text-ink/60" />
        <h2 className="bignum text-2xl">FINDING REAL STORES</h2>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-ink/60">
          ◉ FROM OPENSTREETMAP · A COUPLE SECONDS
        </p>
      </div>
    );
  }

  if (!origin) {
    router.push('/shop');
    return null;
  }

  if (!results || results.plans.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <ShoppingCart className="mx-auto mb-4 size-12 text-ink/30" />
        <h2 className="bignum text-3xl">NO RESULTS</h2>
        <p className="mt-2 text-sm text-ink/60">Add items to your list first</p>
        <button onClick={() => router.push('/shop/list')} className="btn-ink mt-5">
          Back to List
        </button>
      </div>
    );
  }

  const { plans, fulfilmentByRetailer, assignedStores } = results;
  const storesByRetailer = new Map(assignedStores.map((s) => [s.retailerCode, s]));
  const unresolvedItems = items.filter((i) => !i.productId && !i.genericType);
  const bestPlan = plans[0]!;
  const bestSinglePlan = plans.find((p) => p.kind === 'single_retailer');
  const multiPlan = plans.find((p) => p.kind === 'multi_retailer');
  const WORTH_SPLIT_THRESHOLD = 3.0; // dollars

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.16em] text-ink/70">
            ◉ BEST DEALS · LIVE
          </div>
          <h1 className="bignum mt-4 text-[clamp(40px,7vw,68px)] leading-[0.95]">
            YOUR <span className="mark-lime">BASKET</span>,
            <br />
            REALIGNED.
          </h1>
          <p className="mt-3 text-sm text-ink/70">
            <MapPin className="mr-1 inline size-3" />
            {suburb} ({postcode}) · {items.filter((i) => i.productId || i.genericType).length}{' '}
            items compared across {assignedStores.length} retailer
            {assignedStores.length === 1 ? '' : 's'}
          </p>
        </div>
        <button onClick={() => router.push('/shop/list')} className="btn-outline text-xs">
          <ArrowLeft className="size-3.5" />
          Edit List
        </button>
      </div>

      {unresolvedItems.length > 0 && (
        <div className="flex items-start gap-2 rounded-xl border-[1.5px] border-ink bg-tomato/15 p-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" style={{ color: 'var(--tomato)' }} />
          <div className="text-sm">
            <strong>{unresolvedItems.length} item(s)</strong> couldn&apos;t be matched:{' '}
            {unresolvedItems.map((i) => i.query).join(', ')}
          </div>
        </div>
      )}

      {assignedStores.length > 0 && (
        <div className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.12em] text-ink/60">
          <MapPin className="size-3" />
          Store details · OpenStreetMap · {assignedStores.length} retailer
          {assignedStores.length === 1 ? '' : 's'} matched
        </div>
      )}
      {assignedStores.length === 0 && nearbyStores.length === 0 && (
        <div className="rounded-xl border-[1.5px] border-ink bg-tomato/15 p-3 text-sm">
          We couldn&apos;t reach OpenStreetMap, so we&apos;re using estimated distances from
          your postcode centroid.
        </div>
      )}

      {/* INK VERDICT CARD — the eye-catcher (from comparison artboard) */}
      <motion.div
        className="brut-card overflow-hidden p-6"
        style={{ background: 'var(--ink)', color: 'var(--cream)' }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="font-mono text-[11px] tracking-[0.18em]" style={{ color: 'var(--lime)' }}>
          SMARTSHOPPER VERDICT
        </div>
        <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-3">
          <div
            className="bignum text-[clamp(48px,8vw,80px)] leading-none"
            style={{ color: 'var(--lime)' }}
          >
            {formatAUD(bestPlan.grandTotal)}
          </div>
          <div className="pb-1 text-sm sm:text-base">
            {plans.length > 1 && plans[plans.length - 1]!.grandTotal > bestPlan.grandTotal && (
              <>
                <div className="line-through text-cream/40">
                  {formatAUD(plans[plans.length - 1]!.grandTotal)} otherwise
                </div>
                <div className="font-bold" style={{ color: 'var(--lime)' }}>
                  Save{' '}
                  {formatAUD(plans[plans.length - 1]!.grandTotal - bestPlan.grandTotal)} (
                  {Math.round(
                    ((plans[plans.length - 1]!.grandTotal - bestPlan.grandTotal) /
                      plans[plans.length - 1]!.grandTotal) *
                      100,
                  )}
                  %)
                </div>
              </>
            )}
          </div>
        </div>
        {/* Explicit basket vs travel breakdown. The big lime number above
            is the all-in cost the optimiser ranks by; this strip makes it
            clear what's products and what's getting there. */}
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[12px] text-cream/70">
          <span>
            <span className="text-cream/50">Basket</span>{' '}
            <span className="font-bold text-cream">{formatAUD(bestPlan.subtotal)}</span>
          </span>
          {bestPlan.totalFees > 0 && (
            <span>
              <span className="text-cream/50">·</span>{' '}
              <span className="text-cream/50">Fees</span>{' '}
              <span className="font-bold text-cream">+{formatAUD(bestPlan.totalFees)}</span>
            </span>
          )}
          {bestPlan.totalTravelCost > 0 && (
            <span>
              <span className="text-cream/50">·</span>{' '}
              <span className="text-cream/50">Travel*</span>{' '}
              <span className="font-bold text-cream">+{formatAUD(bestPlan.totalTravelCost)}</span>
            </span>
          )}
          {bestPlan.totalLoyaltyRebate > 0 && (
            <span>
              <span className="text-cream/50">·</span>{' '}
              <span className="text-cream/50">Loyalty</span>{' '}
              <span className="font-bold" style={{ color: 'var(--lime)' }}>
                −{formatAUD(bestPlan.totalLoyaltyRebate)}
              </span>
            </span>
          )}
          {(bestPlan.totalFees > 0 ||
            bestPlan.totalTravelCost > 0 ||
            bestPlan.totalLoyaltyRebate > 0) && (
            <span className="text-cream/50">= {formatAUD(bestPlan.grandTotal)}</span>
          )}
        </div>
        {bestPlan.totalTravelCost > 0 && (
          <div className="mt-1 font-mono text-[10px] italic text-cream/40">
            * travel cost estimated — assumes driving at ${preferences.fuelCostPerKm.toFixed(2)}/km
          </div>
        )}
        <div className="mt-4 text-sm leading-relaxed text-cream/80">
          Cheapest with{' '}
          <b style={{ color: 'var(--lime)' }}>
            {bestPlan.retailerCodes
              .map((c) => RETAILER_NAMES[c] ?? c)
              .join(bestPlan.retailerCodes.length > 1 ? ' + ' : '')}
          </b>
          {bestPlan.totalTravelCost > 0 && (
            <>
              {' '}— total trip cost {formatAUD(bestPlan.totalTravelCost)} factored in.
            </>
          )}
          {bestPlan.kind === 'multi_retailer' && (
            <>
              {' '}
              <span style={{ color: 'var(--tomato)' }}>
                Splitting basket beats a single-store run.
              </span>
            </>
          )}
        </div>
        <div className="mt-5 flex flex-wrap gap-2.5">
          <button onClick={() => router.push('/shop/list')} className="btn-lime text-sm">
            Get directions →
          </button>
          <button
            onClick={() => router.push('/shop/list')}
            className="rounded-full border-[1.5px] border-cream bg-transparent px-5 py-3 text-sm font-medium text-cream hover:bg-cream hover:text-ink transition-colors"
          >
            Edit list
          </button>
        </div>
      </motion.div>

      {/* Savings breakdown — receipt aesthetic */}
      {bestSinglePlan && multiPlan && bestPlan.lines.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="brut-card p-5"
        >
          <div className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em]">
            <Star className="size-3.5" style={{ color: 'var(--tomato)' }} />
            SMARTSHOPPER VERDICT
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border-[1.5px] border-ink bg-cream/60 p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink/70">
                Stay at one store
              </div>
              <div className="bignum mt-2 text-3xl">
                {formatAUD(bestSinglePlan.grandTotal)}
              </div>
              <div className="mt-1 text-xs text-ink/60">
                {RETAILER_NAMES[bestSinglePlan.retailerCodes[0]!] ??
                  bestSinglePlan.retailerCodes[0]}
              </div>
            </div>
            <div
              className={`rounded-xl border-[1.5px] border-ink p-4 ${
                (multiPlan.savingsVsBestSingle ?? 0) >= WORTH_SPLIT_THRESHOLD
                  ? 'bg-lime'
                  : 'bg-cream/60'
              }`}
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink/70">
                Split across {multiPlan.retailerCodes.length} stores
              </div>
              <div className="bignum mt-2 text-3xl">{formatAUD(multiPlan.grandTotal)}</div>
              <div className="mt-1 text-xs">
                {(multiPlan.savingsVsBestSingle ?? 0) >= WORTH_SPLIT_THRESHOLD ? (
                  <span className="font-semibold">
                    Saves {formatAUD(multiPlan.savingsVsBestSingle!)} — worth it
                  </span>
                ) : (multiPlan.savingsVsBestSingle ?? 0) > 0 ? (
                  <span className="text-ink/60">
                    Only saves {formatAUD(multiPlan.savingsVsBestSingle!)} — probably not worth
                    the extra trip
                  </span>
                ) : (
                  <span className="text-ink/40">Costs more once travel is added</span>
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
          storesByRetailer={storesByRetailer}
        />
        </motion.div>
      ))}

      {/* Three footer cards — pattern / forecast / bundle (from comparison artboard) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FootCard
          label="BASKET PATTERN"
          big={`${bestPlan.lines.length} items`}
          note={`Optimised across ${bestPlan.retailerCodes.length} retailer${
            bestPlan.retailerCodes.length === 1 ? '' : 's'
          }. ${bestPlan.lines.filter((l) => l.isTrueSpecial).length} true specials caught.`}
          color="lime"
        />
        <FootCard
          label="TRAVEL COST · IF DRIVING"
          big={
            bestPlan.totalTravelCost > 0
              ? `+${formatAUD(bestPlan.totalTravelCost)}`
              : 'No travel'
          }
          note={
            bestPlan.totalTravelCost > 0
              ? `Fuel cost across ${bestPlan.retailerCodes.length} stop${
                  bestPlan.retailerCodes.length === 1 ? '' : 's'
                } at $${preferences.fuelCostPerKm}/km.`
              : 'Walkable or delivery — no fuel cost factored in.'
          }
          color="tomato"
          inv
        />
        <FootCard
          label="BUNDLE SAVINGS"
          big={
            plans.length > 1 && plans[plans.length - 1]!.grandTotal > bestPlan.grandTotal
              ? `+ ${formatAUD(plans[plans.length - 1]!.grandTotal - bestPlan.grandTotal)}`
              : '$0'
          }
          note="vs. the worst single-store option. Members + true specials stacked where eligible."
          color="cobalt"
          inv
        />
      </div>

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
            preloaded={nearbyStores}
          />
        </motion.div>
      )}
    </div>
  );
}

function FootCard({
  label,
  big,
  note,
  color,
  inv,
}: {
  label: string;
  big: string;
  note: string;
  color: 'lime' | 'tomato' | 'cobalt';
  inv?: boolean;
}) {
  const hex = color === 'lime' ? '#DCFF3D' : color === 'tomato' ? '#FF4D2E' : '#2A3CFF';
  return (
    <div
      className="brut-card p-5"
      style={{
        background: inv ? hex : 'var(--paper)',
        color: inv ? 'var(--cream)' : 'var(--ink)',
      }}
    >
      <div
        className="font-mono text-[10px] tracking-[0.16em]"
        style={{ color: inv ? 'rgba(247,242,231,0.7)' : 'var(--ink-70)' }}
      >
        {label}
      </div>
      <div
        className="bignum mt-2 text-[28px]"
        style={{
          color: inv ? 'var(--cream)' : color === 'lime' ? 'var(--ink)' : hex,
        }}
      >
        {big}
      </div>
      <div className="mt-2 text-[12px] leading-relaxed opacity-85">{note}</div>
    </div>
  );
}

function PlanCard({
  plan,
  rank,
  fulfilment,
  worstTotal,
  storesByRetailer,
}: {
  plan: OptimiserPlan;
  rank: number;
  fulfilment: Map<string, Quote[]>;
  worstTotal: number;
  storesByRetailer: Map<string, import('@/lib/catalogue').StoreInfo>;
}) {
  const isBest = rank === 0;
  const savings = worstTotal - plan.grandTotal;

  return (
    <div
      className={`brut-card overflow-hidden ${isBest ? 'brut-card--lg' : ''}`}
      style={{
        borderLeft: isBest ? '6px solid var(--tomato)' : undefined,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{
          background: isBest ? 'var(--lime)' : 'var(--cream-2)',
          borderBottom: '1.5px solid var(--ink)',
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          {isBest && (
            <span className="ss-chip ss-chip--ink">
              <Award className="size-3" />
              BEST OPTION
            </span>
          )}
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink/70">
            {plan.kind.replace(/_/g, ' ')}
          </span>
          <div className="flex gap-1.5">
            {plan.retailerCodes.map((code) => (
              <span
                key={code}
                className={`ss-chip ${isBest ? '' : ''}`}
                style={{ background: 'var(--paper)' }}
              >
                {RETAILER_NAMES[code] ?? code}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right">
          <div className="bignum text-3xl">{formatAUD(plan.grandTotal)}</div>
          {/* basket / travel / fees split — keep products visible separately
              from the all-in cost so users see what they're really paying for. */}
          <div className="mt-1 font-mono text-[10px] text-ink/60">
            {formatAUD(plan.subtotal)} basket
            {plan.totalFees > 0 && <> · +{formatAUD(plan.totalFees)} fees</>}
            {plan.totalTravelCost > 0 && <> · +{formatAUD(plan.totalTravelCost)} travel*</>}
            {plan.totalLoyaltyRebate > 0 && <> · −{formatAUD(plan.totalLoyaltyRebate)} loyalty</>}
          </div>
          {savings > 0.5 && (
            <div className="mt-0.5 font-mono text-xs font-bold" style={{ color: 'var(--tomato)' }}>
              SAVE {formatAUD(savings)}
            </div>
          )}
        </div>
      </div>

      {/* Real store details per retailer (name, address, hours from OSM) */}
      <div
        className="space-y-2.5 px-5 py-3"
        style={{ borderBottom: '1px dashed var(--ink-15)', background: 'var(--cream-2)' }}
      >
        {plan.retailerCodes.map((code, i) => {
          const store = storesByRetailer.get(code);
          const hours = formatOpeningHours(store?.hours) ?? RETAILER_FALLBACK_HOURS[code];
          return (
            <div key={code} className="flex items-start gap-3 text-xs">
              <span className="store__bug" style={{ width: 30, height: 30, fontSize: 11 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="ss-chip" style={{ background: 'var(--paper)', fontSize: 10, padding: '2px 8px' }}>
                    {RETAILER_NAMES[code] ?? code}
                  </span>
                  {store && (
                    <span className="font-medium">{store.storeName}</span>
                  )}
                  {store?.distanceLabel && (
                    <span className="font-mono text-ink/50">{store.distanceLabel}</span>
                  )}
                </div>
                {store?.address && (
                  <div className="flex items-center gap-1 text-ink/60">
                    <MapPin className="size-3 shrink-0" />
                    <span className="truncate">{store.address}</span>
                  </div>
                )}
                {hours && (
                  <div className="flex items-center gap-1 text-ink/50">
                    <Clock className="size-3 shrink-0" />
                    <span className="truncate">{hours}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Line items */}
      <div className="bg-paper">
        {plan.lines.map((line, i) => {
          const alt = plan.lineAlternatives?.find((a) => a.listItemId === line.listItemId);
          const allPrices = getAllPricesFor(line.productId);
          const hasConvenience = allPrices.some((p) => p.isConvenience);
          return (
            <div
              key={line.listItemId}
              className="px-5 py-3 text-sm"
              style={{
                borderBottom:
                  i < plan.lines.length - 1 ? '1px dashed var(--ink-15)' : 'none',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-medium">{line.productName}</span>
                  {line.quantity > 1 && (
                    <span className="font-mono text-xs text-ink/40">×{line.quantity}</span>
                  )}
                  {line.isTrueSpecial && (
                    <span className="ss-chip ss-chip--tomato" style={{ padding: '2px 8px', fontSize: 10 }}>
                      <Star className="size-2.5" />
                      Deal
                    </span>
                  )}
                  {line.memberOnly && (
                    <span className="ss-chip ss-chip--cobalt" style={{ padding: '2px 8px', fontSize: 10 }}>
                      Members
                    </span>
                  )}
                </div>
                <div className="ml-2 flex shrink-0 items-center gap-3">
                  <span
                    className="rounded-full border border-ink/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider"
                    style={{ background: 'var(--cream-2)' }}
                  >
                    {RETAILER_NAMES[line.retailerCode] ?? line.retailerCode}
                  </span>
                  <span className="w-20 text-right font-mono font-semibold">
                    {formatAUD(line.lineTotal)}
                  </span>
                </div>
              </div>

              {/* All-retailer price comparison strip — every retailer (incl. convenience stores) that carries this product. */}
              {allPrices.length > 1 && (
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-ink/55">
                  <span className="uppercase tracking-wider text-ink/40">All prices:</span>
                  {allPrices.map((p, idx) => {
                    const isChosen = p.retailerCode === line.retailerCode && !p.isConvenience;
                    return (
                      <span
                        key={`${p.retailerCode}-${idx}`}
                        className={isChosen ? 'font-bold text-ink' : ''}
                        style={{ color: p.isConvenience ? 'var(--ink-40)' : undefined }}
                      >
                        {RETAILER_NAMES[p.retailerCode] ?? p.retailerCode}{' '}
                        <span className={p.isConvenience ? '' : 'text-ink/80'}>
                          ${p.price.toFixed(2)}
                        </span>
                        {p.isTrueSpecial && <span style={{ color: 'var(--tomato)' }}>✦</span>}
                        {p.isConvenience && <span>*</span>}
                      </span>
                    );
                  })}
                  {hasConvenience && (
                    <span className="text-ink/40 italic">* convenience, premium</span>
                  )}
                </div>
              )}

              {alt && (
                <div
                  className="ml-0.5 mt-1 flex items-center gap-1 text-[11px] font-medium"
                  style={{ color: 'var(--tomato)' }}
                >
                  <span>↓</span>
                  <span>
                    {formatAUD(alt.savingsPerUnit)} cheaper at{' '}
                    {RETAILER_NAMES[alt.cheaperRetailerCode] ?? alt.cheaperRetailerCode} (
                    {formatAUD(alt.cheaperPrice)})
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cost breakdown — receipt style */}
      <div
        className="space-y-1 px-5 py-3 font-mono text-[13px]"
        style={{
          borderTop: '1.5px dashed var(--ink-15)',
          background: 'var(--cream)',
        }}
      >
        <div className="flex justify-between text-ink/70">
          <span>SUBTOTAL</span>
          <span>{formatAUD(plan.subtotal)}</span>
        </div>
        {plan.totalFees > 0 && (
          <div className="flex justify-between text-ink/70">
            <span>DELIVERY / FEES</span>
            <span>+{formatAUD(plan.totalFees)}</span>
          </div>
        )}
        {plan.totalTravelCost > 0 && (
          <div className="flex justify-between text-ink/70">
            <span>TRAVEL (FUEL)*</span>
            <span>+{formatAUD(plan.totalTravelCost)}</span>
          </div>
        )}
        {plan.totalLoyaltyRebate > 0 && (
          <div className="flex justify-between font-bold" style={{ color: 'var(--tomato)' }}>
            <span>LOYALTY REBATE</span>
            <span>−{formatAUD(plan.totalLoyaltyRebate)}</span>
          </div>
        )}
      </div>

      {/* Fulfilment options for best plan */}
      {rank === 0 && plan.retailerCodes.some((c) => fulfilment.has(c)) && (
        <div
          className="px-5 py-4"
          style={{ borderTop: '1.5px solid var(--ink)', background: 'var(--paper)' }}
        >
          <h3 className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-ink/70">
            <Truck className="size-3.5" />
            DELIVERY vs PICKUP
          </h3>
          <div className="space-y-3">
            {plan.retailerCodes.map((code) => {
              const quotes = fulfilment.get(code);
              if (!quotes?.length) return null;
              return (
                <div key={code}>
                  <div className="mb-1.5 text-xs font-semibold text-ink/70">
                    {RETAILER_NAMES[code] ?? code}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {quotes
                      .filter((q) => q.eligible)
                      .slice(0, 3)
                      .map((q, i) => (
                        <div
                          key={q.mode}
                          className="rounded-xl border-[1.5px] p-3 text-sm"
                          style={{
                            borderColor: 'var(--ink)',
                            background: i === 0 ? 'var(--lime)' : 'var(--paper)',
                          }}
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider">
                              {q.mode.replace(/_/g, ' ')}
                            </span>
                            <span className="font-mono text-xs font-semibold">
                              {formatAUD(q.totalCost)}
                            </span>
                          </div>
                          <div className="text-xs text-ink/60">
                            {q.fee > 0 && <span>Fee: {formatAUD(q.fee)} · </span>}
                            {q.distanceKm > 0 && <span>{q.distanceKm.toFixed(1)}km · </span>}
                            {q.roundTripMinutes > 0 && (
                              <span>
                                {Math.round(q.roundTripMinutes)}min{' '}
                                {q.travelCost === 0 && q.distanceKm > 0
                                  ? 'walk'
                                  : q.distanceKm > 0
                                    ? 'drive'
                                    : ''}
                              </span>
                            )}
                            {q.travelCost === 0 && q.distanceKm > 0 && q.distanceKm <= 2 && (
                              <span> · No fuel cost</span>
                            )}
                          </div>
                          {q.explanation && (
                            <div className="mt-1 text-xs text-ink/70">{q.explanation}</div>
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
        <div
          className="px-5 py-3 text-xs text-ink/60"
          style={{ borderTop: '1px dashed var(--ink-15)' }}
        >
          {plan.explanation}
        </div>
      )}
    </div>
  );
}
