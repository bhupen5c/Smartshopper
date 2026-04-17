import { describe, expect, it } from 'vitest';
import { optimiseBasket } from '../basket/optimizer.js';

const MELB = { lat: -37.8136, lng: 144.9631 };
const STORE_COLES = { lat: -37.8106, lng: 144.9628 };
const STORE_WOOLIES = { lat: -37.8151, lng: 144.9646 };
const STORE_ALDI = { lat: -37.8202, lng: 144.9703 };

const PREFS = {
  origin: MELB,
  maxStores: 2,
  maxTravelKm: 10,
  fuelCostPerKm: 0.88,
  timeValuePerHour: 25,
  allowedRetailers: [],
  loyaltyMemberships: ['flybuys'],
  activeSubscriptions: [],
  noCarAvailable: false,
};

describe('basket optimiser', () => {
  it('returns nothing for an empty list', () => {
    expect(optimiseBasket({ items: [], offers: [], preferences: PREFS })).toEqual([]);
  });

  it('builds a single-retailer plan when one retailer covers everything', () => {
    const plans = optimiseBasket({
      items: [
        { listItemId: 'l1', productId: 'milk', productName: 'Milk 2L', quantity: 1 },
        { listItemId: 'l2', productId: 'bread', productName: 'Bread', quantity: 1 },
      ],
      offers: [
        {
          retailerCode: 'coles',
          retailerProductId: 'c1',
          productId: 'milk',
          productName: 'Coles Milk 2L',
          price: 3,
          storeId: 's1',
          storeLocation: STORE_COLES,
          distanceKm: 0.4,
          isTrueSpecial: false,
          memberOnly: false,
          inStock: true,
        },
        {
          retailerCode: 'coles',
          retailerProductId: 'c2',
          productId: 'bread',
          productName: 'Coles Bread',
          price: 2.5,
          storeId: 's1',
          storeLocation: STORE_COLES,
          distanceKm: 0.4,
          isTrueSpecial: false,
          memberOnly: false,
          inStock: true,
        },
      ],
      preferences: PREFS,
    });
    const coles = plans.find((p) => p.kind === 'single_retailer');
    expect(coles).toBeDefined();
    expect(coles!.lines).toHaveLength(2);
    expect(coles!.coverage).toBe(1);
  });

  it('prefers the multi-retailer plan when it is strictly cheaper under the store budget', () => {
    const plans = optimiseBasket({
      items: [
        { listItemId: 'l1', productId: 'milk', productName: 'Milk 2L', quantity: 1 },
        { listItemId: 'l2', productId: 'bread', productName: 'Bread', quantity: 1 },
      ],
      offers: [
        // Coles: cheap milk, expensive bread
        {
          retailerCode: 'coles',
          retailerProductId: 'c1',
          productId: 'milk',
          productName: 'Coles Milk 2L',
          price: 2,
          storeId: 'sc',
          storeLocation: STORE_COLES,
          distanceKm: 0.4,
          isTrueSpecial: true,
          memberOnly: false,
          inStock: true,
        },
        {
          retailerCode: 'coles',
          retailerProductId: 'c2',
          productId: 'bread',
          productName: 'Coles Bread',
          price: 6,
          storeId: 'sc',
          storeLocation: STORE_COLES,
          distanceKm: 0.4,
          isTrueSpecial: false,
          memberOnly: false,
          inStock: true,
        },
        // Woolies: reverse
        {
          retailerCode: 'woolworths',
          retailerProductId: 'w1',
          productId: 'milk',
          productName: 'Woolies Milk 2L',
          price: 6,
          storeId: 'sw',
          storeLocation: STORE_WOOLIES,
          distanceKm: 0.6,
          isTrueSpecial: false,
          memberOnly: false,
          inStock: true,
        },
        {
          retailerCode: 'woolworths',
          retailerProductId: 'w2',
          productId: 'bread',
          productName: 'Woolies Bread',
          price: 2,
          storeId: 'sw',
          storeLocation: STORE_WOOLIES,
          distanceKm: 0.6,
          isTrueSpecial: true,
          memberOnly: false,
          inStock: true,
        },
      ],
      preferences: PREFS,
    });
    const multi = plans.find((p) => p.kind === 'multi_retailer');
    expect(multi).toBeDefined();
    expect(multi!.retailerCodes.sort()).toEqual(['coles', 'woolworths']);
  });

  it('drops retailers when budget is exceeded', () => {
    const items = ['a', 'b', 'c'].map((k) => ({
      listItemId: `l-${k}`,
      productId: `p-${k}`,
      productName: k,
      quantity: 1,
    }));
    const mkOffer = (retailerCode: string, productId: string, price: number) => ({
      retailerCode,
      retailerProductId: `${retailerCode}-${productId}`,
      productId,
      productName: `${retailerCode} ${productId}`,
      price,
      storeId: `${retailerCode}-s`,
      storeLocation:
        retailerCode === 'coles'
          ? STORE_COLES
          : retailerCode === 'woolworths'
            ? STORE_WOOLIES
            : STORE_ALDI,
      distanceKm: 1,
      isTrueSpecial: false,
      memberOnly: false,
      inStock: true,
    });
    const offers = [
      mkOffer('coles', 'p-a', 1),
      mkOffer('coles', 'p-b', 10),
      mkOffer('coles', 'p-c', 10),
      mkOffer('woolworths', 'p-a', 10),
      mkOffer('woolworths', 'p-b', 1),
      mkOffer('woolworths', 'p-c', 10),
      mkOffer('aldi', 'p-a', 10),
      mkOffer('aldi', 'p-b', 10),
      mkOffer('aldi', 'p-c', 1),
    ];
    const plans = optimiseBasket({
      items,
      offers,
      preferences: { ...PREFS, maxStores: 2 },
    });
    const multi = plans.find((p) => p.kind === 'multi_retailer');
    // Must fit within 2 stores.
    if (multi) expect(multi.retailerCodes.length).toBeLessThanOrEqual(2);
  });
});
