import { describe, expect, it } from 'vitest';
import {
  BasketPreferences,
  DeliveryPolicy,
  FulfilmentQuote,
  PriceSnapshot,
  Product,
  RetailerCode,
  Special,
  Store,
} from '../index.js';

describe('zod schemas', () => {
  it('parses a canonical Product', () => {
    const parsed = Product.parse({
      id: '00000000-0000-4000-8000-000000000001',
      gtin: '9310072015385',
      name: 'Arnott\'s Tim Tam Original 200g',
      brand: "Arnott's",
      category: 'Biscuits',
      size: 200,
      unit: 'g',
      matchConfidence: 1,
      imageUrl: null,
    });
    expect(parsed.brand).toBe("Arnott's");
  });

  it('rejects invalid retailer codes', () => {
    expect(() => RetailerCode.parse('tesco')).toThrow();
  });

  it('accepts a full PriceSnapshot', () => {
    const parsed = PriceSnapshot.parse({
      retailerProductId: '00000000-0000-4000-8000-000000000002',
      price: 3.5,
      wasPrice: 7,
      unitPrice: 1.75,
      unitPriceMeasure: '$/100g',
      inStock: true,
      memberOnly: false,
      specialId: null,
      scrapedAt: new Date().toISOString(),
      source: 'scraper',
    });
    expect(parsed.price).toBe(3.5);
  });

  it('requires a non-empty tiers list only if provided', () => {
    const parsed = DeliveryPolicy.parse({
      retailerCode: 'woolworths',
      minimumSpend: 50,
      freeDeliveryThreshold: 250,
      defaultDeliveryFee: 11,
    });
    expect(parsed.tiers).toEqual([]);
    expect(parsed.subscriptions).toEqual([]);
  });

  it('parses a BasketPreferences with distance cost defaults', () => {
    const parsed = BasketPreferences.parse({
      origin: { lat: -37.8136, lng: 144.9631, postcode: '3000' },
    });
    // ATO 2025-26 cents-per-km rate.
    expect(parsed.fuelCostPerKm).toBe(0.88);
    expect(parsed.maxTravelKm).toBe(10);
    expect(parsed.timeValuePerHour).toBe(25);
  });

  it('accepts a FulfilmentQuote with realistic fields', () => {
    const parsed = FulfilmentQuote.parse({
      retailerCode: 'coles',
      storeId: null,
      mode: 'delivery',
      basketSubtotal: 120,
      fee: 11,
      distanceKm: 0,
      roundTripMinutes: 0,
      inStoreMinutes: 0,
      travelCost: 0,
      timeCost: 0,
      loyaltyRebate: 0.6,
      totalCost: 130.4,
      explanation: 'Delivery beats pickup because you spend 30 minutes each way.',
    });
    expect(parsed.mode).toBe('delivery');
  });

  it('parses a Special with multi-buy fields', () => {
    const parsed = Special.parse({
      id: '00000000-0000-4000-8000-00000000000a',
      retailerCode: 'woolworths',
      type: 'multi_buy',
      label: '2 for $6 Tim Tams',
      validFrom: '2026-01-01T00:00:00Z',
      validTo: '2026-01-08T00:00:00Z',
      sourceUrl: 'https://www.woolworths.com.au/shop/productdetails/123',
      multiBuyQty: 2,
      multiBuyPrice: 6,
    });
    expect(parsed.multiBuyPrice).toBe(6);
  });

  it('parses a Store with opening hours', () => {
    const store = Store.parse({
      id: '00000000-0000-4000-8000-00000000000b',
      retailerCode: 'coles',
      externalId: '0372',
      name: 'Coles Melbourne Central',
      addressLine1: 'Level 1, Melbourne Central',
      suburb: 'Melbourne',
      state: 'VIC',
      postcode: '3000',
      location: { lat: -37.8102, lng: 144.9628 },
      phone: '0396631234',
      offersDelivery: true,
      offersClickAndCollect: true,
      offersDirectToBoot: true,
      openingHours: Array.from({ length: 7 }, (_, weekday) => ({
        weekday,
        open: '07:00',
        close: '22:00',
      })),
    });
    expect(store.openingHours).toHaveLength(7);
  });
});
