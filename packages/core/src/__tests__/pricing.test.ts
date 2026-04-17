import { describe, expect, it } from 'vitest';
import { analysePriceHistory, classifyTrueSpecial, detectCycleDays } from '../pricing/index.js';
import { haversineKm, estimateDrivingMinutes } from '../geo.js';

function daysAgo(n: number): string {
  const d = new Date('2026-04-17T00:00:00Z');
  return new Date(d.getTime() - n * 86_400_000).toISOString();
}

function syntheticCycle({ base, low, cycle, days }: { base: number; low: number; cycle: number; days: number }) {
  return Array.from({ length: days }, (_, i) => ({
    price: i % cycle === 0 ? low : base,
    scrapedAt: daysAgo(days - 1 - i),
  }));
}

describe('pricing analytics', () => {
  it('returns null for an empty series', () => {
    expect(analysePriceHistory([])).toBeNull();
  });

  it('computes rolling lows and percentile ranks', () => {
    const snapshots = [
      { price: 6, scrapedAt: daysAgo(100) },
      { price: 5, scrapedAt: daysAgo(80) },
      { price: 3, scrapedAt: daysAgo(40) },
      { price: 4, scrapedAt: daysAgo(15) },
      { price: 3.5, scrapedAt: daysAgo(1) },
    ];
    const result = analysePriceHistory(snapshots, new Date('2026-04-17T00:00:00Z'))!;
    expect(result.currentPrice).toBe(3.5);
    expect(result.low90d).toBe(3);
    expect(result.low365d).toBe(3);
    expect(result.high365d).toBe(6);
    expect(result.percentileRank90d).toBeGreaterThan(0);
    expect(result.percentileRank90d).toBeLessThanOrEqual(1);
  });

  it('detects a 14-day cycle in a synthetic series', () => {
    const series = syntheticCycle({ base: 10, low: 5, cycle: 14, days: 180 });
    const daily = series.map((s, i) => ({
      date: new Date(s.scrapedAt).toISOString().slice(0, 10),
      price: s.price,
    }));
    const { cycleDays, strength } = detectCycleDays(daily);
    expect(cycleDays).toBe(14);
    expect(strength).toBeGreaterThan(0.5);
  });

  it('classifies a deep discount as a true special', () => {
    const history = Array.from({ length: 60 }, (_, i) => ({
      date: `2026-02-${String((i % 28) + 1).padStart(2, '0')}`,
      price: i % 14 === 0 ? 3 : 6,
    }));
    const result = classifyTrueSpecial({
      specialPrice: 3,
      history,
      baseline: 6,
      previousCycleLow: 3,
    });
    expect(result.isTrue).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('flags a shallow discount as cosmetic', () => {
    const history = Array.from({ length: 60 }, (_, i) => ({
      date: `2026-02-${String((i % 28) + 1).padStart(2, '0')}`,
      price: i % 14 === 0 ? 5 : 6,
    }));
    const result = classifyTrueSpecial({
      specialPrice: 5.8,
      history,
      baseline: 6,
    });
    expect(result.isTrue).toBe(false);
  });
});

describe('geo helpers', () => {
  it('computes haversine distance reasonably for Melbourne CBD ↔ South Yarra (~4 km)', () => {
    const a = { lat: -37.8136, lng: 144.9631 };
    const b = { lat: -37.8388, lng: 144.9925 };
    const km = haversineKm(a, b);
    expect(km).toBeGreaterThan(3);
    expect(km).toBeLessThan(6);
  });

  it('estimates round-trip driving minutes sanely', () => {
    const mins = estimateDrivingMinutes(5);
    expect(mins).toBeGreaterThan(5);
    expect(mins).toBeLessThan(30);
  });
});
