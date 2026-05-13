import { describe, expect, it, vi } from 'vitest';
import { deriveConvenienceStrategy } from '../strategies/derive-convenience.js';
import type { ScrapeContext } from '../types.js';

const ctx = (knownPrices: ScrapeContext['knownPrices']): ScrapeContext => ({
  gemini: null,
  knownPrices,
  log: vi.fn(),
});

describe('deriveConvenienceStrategy', () => {
  it('applies the markup to the cheapest non-special supermarket price', async () => {
    const strategy = deriveConvenienceStrategy({
      retailerCode: 'seven_eleven',
      markup: 1.5,
      productIds: ['p01'],
    });

    const result = await strategy.scrape(
      ctx([
        { retailerCode: 'coles', productId: 'p01', price: 3.6, isTrueSpecial: false, memberOnly: false },
        { retailerCode: 'woolworths', productId: 'p01', price: 3.5, isTrueSpecial: false, memberOnly: false },
        { retailerCode: 'aldi', productId: 'p01', price: 3.19, isTrueSpecial: false, memberOnly: false },
      ]),
    );

    expect(result.prices).toEqual([
      { retailerCode: 'seven_eleven', productId: 'p01', price: 4.79, isTrueSpecial: false, memberOnly: false },
    ]);
    expect(result.ok).toBe(true);
  });

  it('ignores true-special and member-only base prices when picking cheapest', async () => {
    const strategy = deriveConvenienceStrategy({
      retailerCode: 'bp',
      markup: 1.6,
      productIds: ['p09'],
    });

    const result = await strategy.scrape(
      ctx([
        // The $2.00 special would distort the markup if not filtered.
        { retailerCode: 'coles', productId: 'p09', price: 2.0, isTrueSpecial: true, memberOnly: false },
        { retailerCode: 'woolworths', productId: 'p09', price: 3.0, isTrueSpecial: false, memberOnly: true },
        { retailerCode: 'aldi', productId: 'p09', price: 3.49, isTrueSpecial: false, memberOnly: false },
      ]),
    );

    expect(result.prices[0]!.price).toBeCloseTo(3.49 * 1.6, 2);
  });

  it('emits no prices when no supermarket base is known', async () => {
    const strategy = deriveConvenienceStrategy({
      retailerCode: 'shell',
      markup: 1.55,
      productIds: ['p01', 'p14'],
    });

    const result = await strategy.scrape(ctx([]));
    expect(result.prices).toHaveLength(0);
    expect(result.ok).toBe(true);
    expect(result.itemsEmitted).toBe(0);
  });
});
