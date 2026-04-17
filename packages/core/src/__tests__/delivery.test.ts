import { describe, expect, it } from 'vitest';
import { DEFAULT_DELIVERY_POLICIES, recommendFulfilment, bestFulfilment } from '../delivery/index.js';

const MELBOURNE_CBD = { lat: -37.8136, lng: 144.9631 };
const SOUTH_YARRA = { lat: -37.8388, lng: 144.9925 };

describe('delivery recommender', () => {
  it('prefers click-and-collect over delivery when the user values time cheaply', () => {
    // A retiree with abundant time (only $5/h) and a nearby store — pickup should beat delivery.
    const ranked = recommendFulfilment({
      retailerCode: 'coles',
      storeLocation: SOUTH_YARRA,
      origin: MELBOURNE_CBD,
      basketSubtotal: 60,
      policy: DEFAULT_DELIVERY_POLICIES.coles!,
      fuelCostPerKm: 0.88,
      timeValuePerHour: 5,
    });
    const top = ranked.find((q) => q.eligible)!;
    expect(top.mode).not.toBe('delivery');
  });

  it('picks delivery when the user\'s time is valuable and the basket is small', () => {
    // Busy professional at $80/h — driving becomes expensive fast.
    const ranked = recommendFulfilment({
      retailerCode: 'coles',
      storeLocation: SOUTH_YARRA,
      origin: MELBOURNE_CBD,
      basketSubtotal: 60,
      policy: DEFAULT_DELIVERY_POLICIES.coles!,
      fuelCostPerKm: 0.88,
      timeValuePerHour: 80,
    });
    const top = ranked.find((q) => q.eligible)!;
    expect(top.mode).toBe('delivery');
  });

  it('switches to delivery once the basket clears the free-delivery threshold', () => {
    const result = bestFulfilment({
      retailerCode: 'coles',
      storeLocation: SOUTH_YARRA,
      origin: MELBOURNE_CBD,
      basketSubtotal: 260, // > $250 free-delivery threshold
      policy: DEFAULT_DELIVERY_POLICIES.coles!,
      fuelCostPerKm: 0.88,
      timeValuePerHour: 25,
    })!;
    expect(result.mode).toBe('delivery');
    expect(result.fee).toBe(0);
  });

  it('flags ineligible delivery when below minimum spend', () => {
    const ranked = recommendFulfilment({
      retailerCode: 'woolworths',
      storeLocation: SOUTH_YARRA,
      origin: MELBOURNE_CBD,
      basketSubtotal: 30,
      policy: DEFAULT_DELIVERY_POLICIES.woolworths!,
      fuelCostPerKm: 0.88,
      timeValuePerHour: 25,
    });
    const deliveryQuote = ranked.find((q) => q.mode === 'delivery')!;
    expect(deliveryQuote.eligible).toBe(false);
    expect(deliveryQuote.ineligibleReason).toMatch(/minimum/i);
  });

  it('applies Flybuys loyalty rebate when member', () => {
    const ranked = recommendFulfilment({
      retailerCode: 'coles',
      storeLocation: SOUTH_YARRA,
      origin: MELBOURNE_CBD,
      basketSubtotal: 100,
      policy: DEFAULT_DELIVERY_POLICIES.coles!,
      fuelCostPerKm: 0.88,
      timeValuePerHour: 25,
      loyaltyMemberships: ['flybuys'],
    });
    expect(ranked[0]!.loyaltyRebate).toBeGreaterThan(0);
  });

  it('distance absolutely factors into total cost when driving (user-asked)', () => {
    // Isolate the effect of distance by forcing in-store pickup for both cases.
    // We use the internal quoting function directly so we can pin the mode.
    const near = recommendFulfilment({
      retailerCode: 'iga',
      storeLocation: SOUTH_YARRA,
      origin: MELBOURNE_CBD,
      basketSubtotal: 60,
      policy: DEFAULT_DELIVERY_POLICIES.iga!,
      fuelCostPerKm: 0.88,
      timeValuePerHour: 25,
    }).find((q) => q.mode === 'in_store_pickup')!;
    const far = recommendFulfilment({
      retailerCode: 'iga',
      storeLocation: { lat: -37.5, lng: 144.5 }, // ~50 km from CBD
      origin: MELBOURNE_CBD,
      basketSubtotal: 60,
      policy: DEFAULT_DELIVERY_POLICIES.iga!,
      fuelCostPerKm: 0.88,
      timeValuePerHour: 25,
    }).find((q) => q.mode === 'in_store_pickup')!;
    // A 50 km extra drive must cost meaningfully more (fuel + time).
    expect(far.totalCost).toBeGreaterThan(near.totalCost + 50);
    expect(far.distanceKm).toBeGreaterThan(near.distanceKm + 30);
  });
});
